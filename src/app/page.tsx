import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Lifewear Prints</h1>
            <div className="flex gap-6">
              <a href="#products" className="text-gray-600 hover:text-gray-900">Products</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Custom Apparel, Delivered</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Premium quality print-on-demand clothing. Design your style, we handle the rest.
          </p>
          <a href="/design">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Start Designing
            </button>
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Our Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Card 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg">T-Shirt</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Custom T-Shirts</h4>
                <p className="text-gray-600 mb-4">Premium cotton, perfect for any design</p>
                <p className="text-2xl font-bold text-blue-600">From $24.99</p>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg">Hoodie</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Custom Hoodies</h4>
                <p className="text-gray-600 mb-4">Cozy and stylish for any season</p>
                <p className="text-2xl font-bold text-blue-600">From $49.99</p>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg">Tank Top</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Custom Tank Tops</h4>
                <p className="text-gray-600 mb-4">Lightweight and breathable</p>
                <p className="text-2xl font-bold text-blue-600">From $19.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">About Lifewear Prints</h3>
              <p className="text-gray-600 mb-4">
                We're passionate about helping you express yourself through custom apparel. 
                Our print-on-demand service ensures you get exactly what you want, when you want it.
              </p>
              <p className="text-gray-600 mb-4">
                With high-quality materials and state-of-the-art printing technology, 
                your designs come to life with vibrant colors and lasting durability.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Premium quality materials
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Fast shipping
                </li>
                <li className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Eco-friendly printing
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-96"></div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">Get In Touch</h3>
          <p className="text-gray-600 mb-8">
            Have questions? We'd love to hear from you.
          </p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea 
                placeholder="Your Message" 
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Lifewear Prints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
