import React, { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  author: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: '1', title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { id: '2', title: '1984', author: 'George Orwell' },
  ]);

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleBorrow = () => {
    // In a real application, this would initiate the borrowing process
    console.log('Borrowing books:', cartItems);
    setCartItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-gray-600">{item.author}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800 transition duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleBorrow}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <ShoppingCart className="mr-2" />
            Borrow {cartItems.length} {cartItems.length === 1 ? 'Book' : 'Books'}
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;