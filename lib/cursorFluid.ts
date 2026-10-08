// Fluid cursor trail, ported from the "screen paint" technique used on
// lusion.co. Plain WebGL 1, no dependencies.
//
// The pointer doesn't leave particles behind; it paints into a small
// off-screen buffer that stores *motion* rather than color: each texel holds a
// velocity (red/green, biased so 0.5 means "still") and two weights (blue/
// alpha) saying how much paint is there. Every frame the buffer is advected
// along its own blurred velocity field, so the paint keeps flowing in the
// direction it was pushed, curls, and slowly dies away. A final pass turns
// that buffer into something visible.
//
// Lusion's page is a WebGL scene, so their final pass bends the scene itself.
// This page is HTML, which can't be sampled from a shader, so the final pass
// here renders the paint as a translucent liquid on top of the page instead.

const VERTEX = `
attribute vec2 position;
varying vec2 v_uv;

void main() {
  v_uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Paint + advection step. Follows Lusion's shader closely.
const PAINT = `
precision highp float;

uniform sampler2D u_lowPaintTexture;
uniform sampler2D u_prevPaintTexture;
uniform vec2 u_paintTexelSize;
uniform vec2 u_scrollOffset;
uniform vec4 u_drawFrom;
uniform vec4 u_drawTo;
uniform float u_pushStrength;
uniform vec3 u_dissipations;
uniform vec2 u_vel;
uniform float u_curlScale;
uniform float u_curlStrength;
varying vec2 v_uv;

// Distance from p to the segment a-b, and how far along it the nearest point is.
vec2 sdSegment(in vec2 p, in vec2 a, in vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return vec2(length(pa - ba * h), h);
}

vec2 hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

// Gradient noise that also returns its derivatives (yz), used as a curl field.
vec3 noised(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hash(i + vec2(0.0, 0.0));
  vec2 gb = hash(i + vec2(1.0, 0.0));
  vec2 gc = hash(i + vec2(0.0, 1.0));
  vec2 gd = hash(i + vec2(1.0, 1.0));
  float va = dot(ga, f - vec2(0.0, 0.0));
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  return vec3(
    va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
    ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) +
      du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va)
  );
}

void main() {
  // The stroke laid down this frame: a capsule from the last pointer
  // position to the current one, as wide as the pointer was fast.
  vec2 res = sdSegment(gl_FragCoord.xy, u_drawFrom.xy, u_drawTo.xy);
  vec2 radiusWeight = mix(u_drawFrom.zw, u_drawTo.zw, res.y);
  float d = 1.0 - smoothstep(-0.01, radiusWeight.x, res.x);

  // Where this texel's contents came from: upstream along the (blurred)
  // velocity already stored around here, plus some curl so it doesn't flow
  // in dead-straight lines.
  vec4 lowData = texture2D(u_lowPaintTexture, v_uv - u_scrollOffset);
  vec2 velInv = (0.5 - lowData.xy) * u_pushStrength;

  vec3 noise3 = noised(gl_FragCoord.xy * u_curlScale * (1.0 - lowData.xy));
  vec2 noise = noised(gl_FragCoord.xy * u_curlScale * (2.0 - lowData.xy * (0.5 + noise3.x) + noise3.yz * 0.1)).yz;
  velInv += noise * (lowData.z + lowData.w) * u_curlStrength;

  vec4 data = texture2D(u_prevPaintTexture, v_uv - u_scrollOffset + velInv * u_paintTexelSize);
  data.xy -= 0.5;

  // Everything fades a little; the new stroke adds velocity and weight.
  vec4 delta = (u_dissipations.xxyz - 1.0) * data;
  vec2 newVel = u_vel * d;
  delta += vec4(newVel, radiusWeight.yy * d);
  // 8-bit storage: without a minimum step, faint paint would never reach zero.
  delta.zw = sign(delta.zw) * max(vec2(0.004), abs(delta.zw));

  data += delta;
  data.xy += 0.5;
  gl_FragColor = clamp(data, vec4(0.0), vec4(1.0));
}`;

const COPY = `
precision highp float;

uniform sampler2D u_texture;
varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}`;

const BLUR = `
precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_delta;
varying vec2 v_uv;

void main() {
  vec4 color = texture2D(u_texture, v_uv) * 0.2270270270;
  color += texture2D(u_texture, v_uv + u_delta * 1.3846153846) * 0.3162162162;
  color += texture2D(u_texture, v_uv - u_delta * 1.3846153846) * 0.3162162162;
  color += texture2D(u_texture, v_uv + u_delta * 3.2307692308) * 0.0702702703;
  color += texture2D(u_texture, v_uv - u_delta * 3.2307692308) * 0.0702702703;
  gl_FragColor = color;
}`;

// Turns the paint buffer into a translucent liquid: tinted body, a moving
// highlight where its surface slopes, and Lusion's iridescent fringe where
// the paint is thin and fast.
const DISPLAY = `
precision highp float;

uniform sampler2D u_paintTexture;
uniform vec2 u_paintTexelSize;
uniform vec3 u_color;
varying vec2 v_uv;

float weightAt(vec2 uv) {
  vec4 data = texture2D(u_paintTexture, uv);
  return (data.z + data.w) * 0.5;
}

void main() {
  vec4 data = texture2D(u_paintTexture, v_uv);
  float weight = (data.z + data.w) * 0.5;
  vec2 vel = (0.5 - data.xy - 0.001) * 2.0 * weight;

  // Treat the amount of paint as a height field and light it from above-left,
  // which is what makes it read as a wet surface instead of a flat tint.
  vec2 e = u_paintTexelSize * 1.5;
  vec2 slope = vec2(
    weightAt(v_uv + vec2(e.x, 0.0)) - weightAt(v_uv - vec2(e.x, 0.0)),
    weightAt(v_uv + vec2(0.0, e.y)) - weightAt(v_uv - vec2(0.0, e.y))
  );
  vec3 normal = normalize(vec3(-slope * 6.0, 1.0));
  float glint = pow(max(dot(normal, normalize(vec3(-0.45, 0.6, 0.65))), 0.0), 24.0);

  float body = smoothstep(0.0, 0.34, weight);
  float speed = max(abs(vel.x), abs(vel.y));
  // Same formula as the original; smoothstep is written the right way round
  // (its edges are reversed there, which GLSL leaves undefined).
  float thin = 1.0 - smoothstep(-0.9, 0.4, weight);
  vec3 fringe = sin(vec3(vel.x + vel.y) * 40.0 + vec3(0.0, 2.0, 4.0)) * thin * 1.25 * speed;

  // Kept faint on purpose: a hint of liquid passing over the page, not a
  // coat of paint. Most of what's visible is the highlight and the fringe.
  float alpha = clamp(body * 0.13 + glint * body * 0.22 + length(fringe) * 0.3, 0.0, 0.5);
  vec3 color = u_color + fringe * 1.6 + vec3(glint * body);

  // Premultiplied alpha, as the canvas expects.
  gl_FragColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);
}`;

// Tuning. Lusion's own values are noted where these differ: theirs bend a
// WebGL scene, where a thin fast stroke is enough; drawn as visible liquid
// over a page it needs to be wider, slower and longer-lived to read at all.
const MIN_RADIUS = 14; // px on screen, for the slowest movement (Lusion: 0)
const MAX_RADIUS = 150; // px on screen, reached at RADIUS_DISTANCE_RANGE px of travel per frame (Lusion: 100)
const RADIUS_DISTANCE_RANGE = 90;
const PUSH_STRENGTH = 13; // texels the paint is carried per frame at full speed (Lusion: 25)
const ACCELERATION_DISSIPATION = 0.8;
const VELOCITY_DISSIPATION = 0.985;
const WEIGHT1_DISSIPATION = 0.985;
const WEIGHT2_DISSIPATION = 0.5;
const CURL_SCALE = 0.1;
const CURL_STRENGTH = 3;
/** Successive blur passes over the low-res velocity copy, each this many texels wide per tap step. */
const BLUR_SPREADS = [1, 2, 3];

/** Frames the simulation keeps running after the last input, long enough for all paint to fade. */
const IDLE_FRAMES = 320;

interface Target {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

export interface CursorFluid {
  /** Pointer position in CSS pixels, relative to the viewport. */
  move(x: number, y: number): void;
  /** Vertical scroll since the last call, in CSS pixels; carries the paint along with the page. */
  scroll(deltaY: number): void;
  resize(): void;
  /** Advances and draws one frame. Returns false once there is nothing left to animate. */
  frame(deltaSeconds: number): boolean;
  destroy(): void;
}

export function createCursorFluid(canvas: HTMLCanvasElement, color: [number, number, number]): CursorFluid | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });

  // A canvas hands back the same context every time it's asked, so a context
  // lost earlier (GPU reset, too many contexts) stays lost here.
  if (!gl || gl.isContextLost()) {
    return null;
  }

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);

    if (!shader) throw new Error('Could not create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
  };

  let vertexShader: WebGLShader;

  const createProgram = (fragmentSource: string) => {
    const program = gl.createProgram();

    if (!program) throw new Error('Could not create program');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.bindAttribLocation(program, 0, 'position');
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
    }

    const uniforms = new Map<string, WebGLUniformLocation | null>();

    return {
      program,
      uniform: (name: string) => {
        if (!uniforms.has(name)) {
          uniforms.set(name, gl.getUniformLocation(program, name));
        }

        return uniforms.get(name) ?? null;
      },
    };
  };

  let paintProgram: ReturnType<typeof createProgram>;
  let copyProgram: ReturnType<typeof createProgram>;
  let blurProgram: ReturnType<typeof createProgram>;
  let displayProgram: ReturnType<typeof createProgram>;

  try {
    vertexShader = compile(gl.VERTEX_SHADER, VERTEX);
    paintProgram = createProgram(PAINT);
    copyProgram = createProgram(COPY);
    blurProgram = createProgram(BLUR);
    displayProgram = createProgram(DISPLAY);
  } catch (error) {
    console.error('Cursor fluid disabled', error);
    return null;
  }

  // One triangle that covers the whole viewport.
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);

  const createTarget = (): Target => {
    const texture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();

    if (!texture || !framebuffer) throw new Error('Could not create render target');

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return { framebuffer, texture, width: 0, height: 0 };
  };

  // "Still, no paint": velocity at its 0.5 midpoint, both weights at zero.
  const resizeTarget = (target: Target, width: number, height: number) => {
    target.width = width;
    target.height = height;
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
    gl.clearColor(0.5, 0.5, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  let prevPaint = createTarget();
  let currPaint = createTarget();
  const low = createTarget();
  const lowBlur = createTarget();

  const bindTexture = (unit: number, texture: WebGLTexture) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  };

  const draw = (target: Target | null) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    gl.viewport(0, 0, target ? target.width : canvas.width, target ? target.height : canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let viewportWidth = 1;
  let viewportHeight = 1;

  // Pointer in CSS pixels; null until it has been seen once.
  let pointer: { x: number; y: number } | null = null;
  let lastPointer: { x: number; y: number } | null = null;
  let pendingScroll = 0;
  let idleFrames = IDLE_FRAMES;

  // Stroke endpoints in paint-buffer pixels: x, y, radius, weight.
  let drawFrom = [0, 0, 0, 0];
  let drawTo = [0, 0, 0, 0];
  let velocity = [0, 0];

  const resize = () => {
    viewportWidth = Math.max(1, window.innerWidth);
    viewportHeight = Math.max(1, window.innerHeight);

    // The liquid is soft; half resolution on screen is plenty.
    canvas.width = Math.max(1, viewportWidth >> 1);
    canvas.height = Math.max(1, viewportHeight >> 1);

    const paintWidth = Math.max(1, viewportWidth >> 2);
    const paintHeight = Math.max(1, viewportHeight >> 2);

    resizeTarget(prevPaint, paintWidth, paintHeight);
    resizeTarget(currPaint, paintWidth, paintHeight);
    resizeTarget(low, Math.max(1, viewportWidth >> 3), Math.max(1, viewportHeight >> 3));
    resizeTarget(lowBlur, low.width, low.height);

    drawFrom = [0, 0, 0, 0];
    drawTo = [0, 0, 0, 0];
    velocity = [0, 0];
    lastPointer = null;
  };

  resize();

  const frame = (deltaSeconds: number) => {
    const moved = pointer !== null && (lastPointer === null || pointer.x !== lastPointer.x || pointer.y !== lastPointer.y);

    if (moved || pendingScroll !== 0) {
      idleFrames = 0;
    } else {
      idleFrames += 1;
    }

    // All paint has faded: wipe the screen and stop until there's input again.
    if (idleFrames > IDLE_FRAMES) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      lastPointer = pointer ? { ...pointer } : null;
      return false;
    }

    const delta = Math.min(deltaSeconds, 1 / 30);
    const scrollOffset = pendingScroll / viewportHeight;

    pendingScroll = 0;

    // Radius grows with how far the pointer travelled this frame.
    let radius = 0;

    if (pointer && lastPointer && moved) {
      const distance = Math.hypot(pointer.x - lastPointer.x, pointer.y - lastPointer.y);

      radius = MIN_RADIUS + (Math.min(distance, RADIUS_DISTANCE_RANGE) / RADIUS_DISTANCE_RANGE) * (MAX_RADIUS - MIN_RADIUS);
      radius = (radius / viewportHeight) * currPaint.height;
    }

    drawFrom = drawTo;

    if (pointer) {
      // CSS pixels (y down) → paint-buffer pixels (y up).
      drawTo = [
        (pointer.x / viewportWidth) * currPaint.width,
        (1 - pointer.y / viewportHeight) * currPaint.height,
        radius,
        1,
      ];

      // First sighting: start the stroke here rather than from the corner.
      if (!lastPointer) {
        drawFrom = [drawTo[0], drawTo[1], 0, 0];
      }

      lastPointer = { ...pointer };
    }

    velocity = [
      velocity[0] * ACCELERATION_DISSIPATION + (drawTo[0] - drawFrom[0]) * delta * 0.8,
      velocity[1] * ACCELERATION_DISSIPATION + (drawTo[1] - drawFrom[1]) * delta * 0.8,
    ];

    // 1. Paint + advect: read the previous buffer, write the current one.
    [prevPaint, currPaint] = [currPaint, prevPaint];

    gl.useProgram(paintProgram.program);
    bindTexture(0, low.texture);
    bindTexture(1, prevPaint.texture);
    gl.uniform1i(paintProgram.uniform('u_lowPaintTexture'), 0);
    gl.uniform1i(paintProgram.uniform('u_prevPaintTexture'), 1);
    gl.uniform2f(paintProgram.uniform('u_paintTexelSize'), 1 / currPaint.width, 1 / currPaint.height);
    gl.uniform2f(paintProgram.uniform('u_scrollOffset'), 0, scrollOffset);
    gl.uniform4f(paintProgram.uniform('u_drawFrom'), drawFrom[0], drawFrom[1], drawFrom[2], drawFrom[3]);
    gl.uniform4f(paintProgram.uniform('u_drawTo'), drawTo[0], drawTo[1], drawTo[2], drawTo[3]);
    gl.uniform1f(paintProgram.uniform('u_pushStrength'), PUSH_STRENGTH);
    gl.uniform3f(
      paintProgram.uniform('u_dissipations'),
      VELOCITY_DISSIPATION,
      WEIGHT1_DISSIPATION,
      WEIGHT2_DISSIPATION,
    );
    gl.uniform2f(paintProgram.uniform('u_vel'), velocity[0], velocity[1]);
    gl.uniform1f(paintProgram.uniform('u_curlScale'), CURL_SCALE);
    gl.uniform1f(paintProgram.uniform('u_curlStrength'), CURL_STRENGTH);
    draw(currPaint);

    // 2. A small blurred copy, used next frame as the velocity field to flow along.
    gl.useProgram(copyProgram.program);
    bindTexture(0, currPaint.texture);
    gl.uniform1i(copyProgram.uniform('u_texture'), 0);
    draw(low);

    // Blurred wide on purpose: a stroke's velocity gets spread over its
    // surroundings, which both slows the flow down to a drift and drags
    // nearby paint along with it.
    gl.useProgram(blurProgram.program);
    gl.uniform1i(blurProgram.uniform('u_texture'), 0);

    for (const spread of BLUR_SPREADS) {
      bindTexture(0, low.texture);
      gl.uniform2f(blurProgram.uniform('u_delta'), spread / low.width, 0);
      draw(lowBlur);
      bindTexture(0, lowBlur.texture);
      gl.uniform2f(blurProgram.uniform('u_delta'), 0, spread / low.height);
      draw(low);
    }

    // 3. Show it.
    gl.useProgram(displayProgram.program);
    bindTexture(0, currPaint.texture);
    gl.uniform1i(displayProgram.uniform('u_paintTexture'), 0);
    gl.uniform2f(displayProgram.uniform('u_paintTexelSize'), 1 / currPaint.width, 1 / currPaint.height);
    gl.uniform3f(displayProgram.uniform('u_color'), color[0], color[1], color[2]);
    draw(null);

    return true;
  };

  return {
    move(x, y) {
      pointer = { x, y };
    },
    scroll(deltaY) {
      pendingScroll += deltaY;
    },
    resize,
    frame,
    // Frees what was allocated but leaves the context itself alive: the same
    // canvas can be set up again (React re-runs effects on a mounted element
    // in development), and a context that was deliberately lost can't be.
    destroy() {
      for (const target of [prevPaint, currPaint, low, lowBlur]) {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      }

      for (const { program } of [paintProgram, copyProgram, blurProgram, displayProgram]) {
        gl.deleteProgram(program);
      }

      gl.deleteShader(vertexShader);
      gl.deleteBuffer(quad);
    },
  };
}
