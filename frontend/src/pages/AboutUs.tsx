import React from 'react';
import { Book, Users, Lightbulb } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-4">
          At the Intelligent Library, our mission is to provide a seamless and enriching experience for book lovers and researchers alike. We strive to make knowledge accessible to all through our innovative library management system.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <Book className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
          <p className="text-gray-600">Access to a wide range of books across various genres and subjects.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <Users className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">User-Centric</h3>
          <p className="text-gray-600">Tailored experiences and recommendations for each user.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
          <Lightbulb className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Innovative Technology</h3>
          <p className="text-gray-600">Leveraging AI and modern tech to enhance the library experience.</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-gray-600 mb-4">
          Founded in 2023, the Intelligent Library was born from a passion for books and a vision to revolutionize the traditional library system. Our team of librarians, software engineers, and book enthusiasts came together to create a platform that combines the charm of physical books with the convenience of digital technology.
        </p>
        <p className="text-gray-600">
          Today, we continue to grow and evolve, always keeping our users at the heart of everything we do. We're committed to fostering a love for reading and learning in our community and beyond.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;