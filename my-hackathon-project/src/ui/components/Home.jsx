// src/ui/components/HomePage.jsx
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="w-full bg-gradient-to-br from-[#d0f0fd] to-[#a8c9ff] text-gray-800 flex flex-col overflow-hidden">
      {/* Navigation */}
      <header className="py-6 px-10 flex justify-between items-center w-full bg-white shadow-md fixed top-0 z-50">
        <div className="text-3xl font-bold text-[#4A4A4A]">BlockFi</div>
        <nav className="space-x-8">
          <a href="#home" className="text-gray-800 hover:text-gray-600">
            Home
          </a>
          <a href="#about" className="text-gray-800 hover:text-gray-600">
            About
          </a>
          <a
            href="#features"
            className="text-gray-800 hover:text-blue-600 transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-800 hover:text-blue-600 transition-colors duration-300"
          >
            Testimonials
          </a>
          <a href="#contact" className="text-gray-800 hover:text-gray-600">
            Contact
          </a>
        </nav>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:text-blue-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </header>
      {/* Introduction Section */}
      <section className="pt-28 px-10 py-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Welcome to BlockFi - Empowering Your Financial Freedom
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
          BlockFi is here to redefine finance with a secure, transparent, and
          decentralized platform built on blockchain technology. Our mission is
          to make managing, trading, and investing in digital assets as
          accessible and trustworthy as possible. Explore our features and join
          the future of decentralized finance today.
        </p>
      </section>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-28 px-10 py-20 flex flex-1 flex-col md:flex-row items-center justify-center w-full"
      >
        <div className="space-y-6 md:max-w-lg text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <span className="bg-[#4A3F55] text-xs uppercase px-4 py-1 rounded-full text-white">
              Blockchain Network
            </span>
            <a
              href="#"
              className="text-[#FF8C00] hover:text-[#FF7F11] text-sm flex items-center space-x-1"
            >
              <span>Explore Now</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight text-gray-800">
            Empowering the Future of{" "}
            <span className="text-[#4A4A4A]">Decentralized Finance</span>
          </h1>
          <p className="text-gray-600">
            Secure, transparent, and decentralized solutions for the future of
            financial technology.
          </p>
        </div>

        {/* Cards Section */}
        <div className="mt-10 md:mt-0 md:ml-10 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="bg-gradient-to-t from-[#c1e6f9] to-[#a8c9ff] p-6 rounded-2xl shadow-lg w-64">
            <p className="text-gray-800 text-lg">BlockFi Wallet</p>
            <p className="text-4xl font-bold text-gray-800">10.5 BTC</p>
            <p className="text-gray-600">Available Balance</p>
          </div>
          <div className="bg-gradient-to-t from-[#c1e6f9] to-[#a8c9ff] p-6 rounded-2xl shadow-lg w-64">
            <p className="text-gray-800 text-lg">BlockFi Wallet</p>
            <p className="text-4xl font-bold text-gray-800">50 ETH</p>
            <p className="text-gray-600">Available Balance</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-10 bg-white">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          About Us
        </h2>
        <p className="max-w-3xl mx-auto text-center text-gray-600 leading-relaxed">
          BlockFi is dedicated to bringing secure, transparent, and
          decentralized solutions to the world of finance. Our platform
          leverages blockchain technology to empower users with financial
          independence and trust in digital transactions.
        </p>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-10 bg-gradient-to-br from-[#e0f7ff] to-[#d0eaff]"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Our Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Decentralized Wallet",
              description:
                "Manage and secure your digital assets in a decentralized wallet accessible from anywhere.",
            },
            {
              title: "Instant Transactions",
              description:
                "Experience lightning-fast transactions with minimal fees, powered by blockchain technology.",
            },
            {
              title: "Advanced Security",
              description:
                "Our platform employs advanced encryption and secure protocols to keep your assets safe.",
            },
            {
              title: "Multi-Currency Support",
              description:
                "Trade and manage multiple cryptocurrencies in one secure and easy-to-use platform.",
            },
            {
              title: "Real-Time Analytics",
              description:
                "Access live market data and analysis tools to make informed trading decisions.",
            },
            {
              title: "24/7 Customer Support",
              description:
                "Get round-the-clock support to resolve issues and get guidance on using our platform.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-10 bg-white">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              quote:
                "BlockFi made it easy to manage my assets securely. I trust them completely!",
              author: "- Alice Johnson, CEO of TechHub",
            },
            {
              quote:
                "The level of transparency and security offered by BlockFi is unmatched.",
              author: "- Mark Thompson, Financial Analyst",
            },
            {
              quote:
                "With BlockFi, I'm confident in the future of decentralized finance!",
              author: "- Sarah Lee, Entrepreneur",
            },
            {
              quote:
                "The user-friendly interface of BlockFi has made managing my assets a breeze!",
              author: "- John Doe, Cryptocurrency Trader",
            },
            {
              quote:
                "Exceptional customer support and secure transactions make BlockFi my top choice.",
              author: "- Jane Smith, Financial Consultant",
            },
            {
              quote:
                "BlockFi's innovative solutions keep me coming back for more investments!",
              author: "- Michael Brown, Blockchain Enthusiast",
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="bg-blue-100 p-6 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <p className="text-gray-800 text-lg font-semibold">
                {testimonial.quote}
              </p>
              <p className="text-gray-500 mt-4">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="py-10 px-10 bg-[#4A4A4A] text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-lg font-semibold">
            BlockFi - Empowering Decentralized Finance
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-300">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-300">
              Contact Us
            </a>
          </div>
        </div>
        <div className="mt-6 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} BlockFi, All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
