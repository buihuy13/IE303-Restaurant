const mockReviews = [
  {
    id: 1,
    name: "Sarah Nguyen",
    content:
      "The food always arrives hot and fresh. Ordering is super easy and fast.",
  },
  {
    id: 2,
    name: "Minh Tran",
    content:
      "Great selection of local restaurants and very reliable delivery time.",
  },
  {
    id: 3,
    name: "Linh Pham",
    content:
      "I love the interface and the promotions. Definitely my go-to food app.",
  },
];

const HomePageReviews = () => {
  return (
    <section className="mt-16 lg:mt-[60px] pb-24 lg:pb-[100px] bg-[#FFCF54]">
      <div className="custom-container p-4 lg:p-0 pt-20 lg:pt-[100px]">
        <div className="text-center lg:text-left">
          <h2 className="font-roboto-serif font-semibold leading-[100%] max-w-[480px] tracking-wide mx-auto lg:mx-0">
            What food lovers are saying about us
          </h2>
        </div>

        <div className="mt-12 lg:mt-[69px] grid gap-6 md:grid-cols-3">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-white/90 p-6 shadow-sm border border-black/5"
            >
              <p className="text-sm text-brand-grey">{review.content}</p>
              <p className="mt-4 font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageReviews;

