const NewsLetter = () => {
  return (
    <section className="pt-16 pb-24 lg:pt-[60px] lg:pb-[100px] bg-brand-green overflow-hidden">
      <div className="mt-[40px] custom-container flex items-center justify-center flex-col">
        <h2 className="font-roboto-serif font-semibold leading-[100%] text-brand-white max-w-[500px] text-center">
          Subscribe newsletter to get updates
        </h2>
        <p className="mt-[20px] font-manrope font-light leading-[30px] text-brand-white max-w-[470px] text-center">
          Download the app for faster ordering and more personalised
          recommendations.
        </p>

        <form className="mt-[38px] w-full max-w-lg flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-brand-purple px-6 py-3 text-sm font-semibold text-white hover:bg-brand-purple/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsLetter;

