import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const reviews = [
  {
    id: 1,
    name: 'Anjali Sharma',
    location: 'Mumbai, MH',
    rating: 5,
    text: 'I was skeptical about ordering organic vegetables online, but the freshness really surprised me. The spinach and tomatoes were far better than what I get at my local mandi. Highly recommended!',
    initials: 'AS'
  },
  {
    id: 2,
    name: 'Rajesh Verma',
    location: 'Bangalore, KA',
    rating: 5,
    text: 'The delivery service is impeccable. I ordered in the morning and received everything by evening. The packaging was eco-friendly which I really appreciate. Great initiative!',
    initials: 'RV'
  },
  {
    id: 3,
    name: 'Sneha Das',
    location: 'Bhubaneswar, OD',
    rating: 4,
    text: 'Finally a platform that connects us directly with farmers. The prices are reasonable for the quality provided. The seasonal fruit basket is my family\'s favorite.',
    initials: 'SD'
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say
          </h2>
          <div className="w-20 h-1 bg-green-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative"
            >
              <FaQuoteLeft className="text-green-200 dark:text-green-900 text-4xl absolute top-6 right-6" />

              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={`${review.id}-star-${i}`}
                    className={i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative z-10">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-lg">
                  {review.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{review.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
