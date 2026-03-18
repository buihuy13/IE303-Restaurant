import Slider from "./Slider";

const HomePageReviews = () => {
        return (
                <section className="mt-0 pb-24 lg:pb-[100px] bg-gradient-to-b from-[#FFCF54] via-[#FFCF54]/80 to-white">
                        <div className="custom-container p-4 lg:p-0 pt-20 lg:pt-[100px]">
                                {/* Title */}
                                <div className="text-center lg:text-left">
                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 max-w-[560px] mx-auto lg:mx-0 leading-tight">
                                                What food lovers are saying about us
                                        </h2>
                                </div>

                                {/* Slider */}
                                <div className="mt-12 lg:mt-[69px]">
                                        <Slider />
                                </div>
                        </div>
                </section>
        );
};

export default HomePageReviews;
