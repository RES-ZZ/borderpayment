import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { FiClock, FiMapPin, FiTag } from "react-icons/fi";

const PriceHistory = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const q = query(
          collection(db, "marketPrices"),
          orderBy("timestamp", "desc"),
          limit(50)
        );

        const querySnapshot = await getDocs(q);
        const priceData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPrices(priceData);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return <div>Loading price history...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Recent Price Submissions</h3>
      <div className="space-y-4">
        {prices.map((price) => (
          <div
            key={price.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full mb-2">
                  {price.category}
                </span>
                <h4 className="font-medium">{price.goodsDescription}</h4>
                <p className="text-lg font-semibold text-green-600">
                  ₹{price.price}
                </p>
              </div>
              {price.imageUrl && (
                <img
                  src={price.imageUrl}
                  alt={price.goodsDescription}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                {price.location}
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {new Date(price.timestamp).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                Reported by: {price.reportedBy}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistory;
