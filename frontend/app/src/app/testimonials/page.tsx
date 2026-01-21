export default function TestimonialsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Testimonials Display Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              What People Say
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Kind words from colleagues, clients, and friends I&apos;ve had the pleasure of working with.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4">
                  {/* Quote Icon */}
                  <svg
                    className="h-8 w-8 text-primary/20 mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.059 14.929 15.489C15.536 14.919 16.486 14.489 17.779 14.199L18.429 14.029L18.429 8.939L17.779 9.179C12.879 10.979 11.279 15.339 10.979 21L14.017 21ZM5.00003 21L8.03803 21C7.73803 15.339 6.13803 10.979 1.23803 9.179L0.588028 8.939L0.588028 14.029L1.23803 14.199C2.53103 14.489 3.48103 14.919 4.08803 15.489C4.69503 16.059 5.00003 16.896 5.00003 18L5.00003 21Z" />
                  </svg>
                  <p className="text-muted-foreground italic">
                    &quot;Mir is an exceptional developer who consistently delivers high-quality code. His attention to detail and problem-solving skills are unmatched. Truly a pleasure to work with!&quot;
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Jane Doe {i}</p>
                    <p className="text-xs text-muted-foreground">CTO at Tech Corp</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submission Form Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto max-w-xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-4">
              Leave a Testimonial
            </h2>
            <p className="text-muted-foreground">
              Worked with me? I&apos;d love to hear your feedback!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8">
            <form className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="t-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Your Name
                </label>
                <input
                  id="t-name"
                  placeholder="Alex Smith"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="t-role"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Role & Company
                </label>
                <input
                  id="t-role"
                  placeholder="Product Manager @ Startup Inc."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="t-message"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Testimonial
                </label>
                <textarea
                  id="t-message"
                  placeholder="Share your experience working with me..."
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
              >
                Submit Testimonial
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
