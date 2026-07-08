import { Link } from "react-router-dom";
import Button from "../components/common/Button";

function Landing() {
  return (
    <main className="px-4">
      <section className="mx-auto flex max-w-6xl justify-center py-12 md:py-20">
        <div className="w-full max-w-[640px] text-center">
          <h1 className="font-heading text-4xl font-bold leading-tight text-charcoal md:text-6xl">
            Find work. Find help. Find each other.
          </h1>
          <p className="mt-5 font-body text-lg text-charcoalMuted">
            myZipJobs connects workers and employers nearby — swipe, match,
            and get to work.
          </p>
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:justify-center">
            <Link to="/register?role=worker" className="md:min-w-[220px]">
              <Button className="w-full">Find Work</Button>
            </Link>
            <Link to="/register?role=employer" className="md:min-w-[220px]">
              <Button variant="secondary" className="w-full">
                Hire Someone
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
