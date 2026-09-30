import Actors from "../components/landing/Actors";
import Channels from "../components/landing/Channels";
import DashboardPreview from "../components/landing/DashboardPreview";
import FinalCta from "../components/landing/FinalCta";
import Footer from "../components/landing/Footer";
import Governance from "../components/landing/Governance";
import Hero from "../components/landing/Hero";
import Journey from "../components/landing/Journey";
import Nav from "../components/landing/Nav";
import Problem from "../components/landing/Problem";
import Score from "../components/landing/Score";
import StatusPipeline from "../components/landing/StatusPipeline";
import Testimonials from "../components/landing/Testimonials";
import Ticker from "../components/landing/Ticker";

// Full landing page: Ticker, Nav, all Stitch sections in order, Footer.
export default function LandingPage() {
  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50 flex flex-col bg-obsidian border-b border-border-subtle">
        <Ticker />
        <Nav />
      </div>
      <main className="w-full pt-28">
        <Hero />
        <Problem />
        <Journey />
        <Channels />
        <Score />
        <DashboardPreview />
        <StatusPipeline />
        <Actors />
        <Governance />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
