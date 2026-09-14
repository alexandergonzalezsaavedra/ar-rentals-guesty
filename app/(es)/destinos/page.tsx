import Menu from '@/components/menu/Menu';

export default function Home() {
  return (
    <>
      <header className='sticky top-0 z-50'>
        <Menu />
      </header>
      <main className='container mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-6'>
          Encuentra tu próximo destino
        </h1>
      </main>
    </>
  );
}
