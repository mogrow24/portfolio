import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageWrapper from '@/components/layout/PageWrapper';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Experience from '@/components/sections/Experience';
import Interview from '@/components/sections/Interview';
import GuestBook from '@/components/sections/GuestBook';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <PageWrapper>
      <main className="relative">
        <Header />
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Interview />
        <GuestBook />
        <Contact />
        <Footer />
      </main>
    </PageWrapper>
  );
}
