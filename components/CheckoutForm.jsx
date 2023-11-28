import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from 'react';

const CheckoutForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement('card'),
      });
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          paymentMethod: paymentMethod.paymentMethod.id,
        }),
      });
      if (!response.ok) return alert('Payment failed');
      const data = await response.json();
      const confirmCardPayment = await stripe.confirmCardPayment(
        data.client_secret,
        {
          paymentMethod: paymentMethod.paymentMethod.id,
        }
      );

      if (confirmCardPayment.error) {
        console.log(confirmCardPayment.error.message);
        alert('Payment failed' + confirmCardPayment.error.message);
      } else {
        if (confirmCardPayment.paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded');
          alert('Payment succeeded');
        }
      }
    } catch (error) {
      console.log(error);
      alert('Payment failed' + error.message);
    }
  };

  return (
    <div className='w-[800px] p-10'>
      <input
        type='text'
        placeholder='name'
        className='w-full p-5 border-2 border-black mb-5 outline-none'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type='text'
        placeholder='email'
        className='w-full p-5 border-2 border-black mb-5 outline-none'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <CardElement />
      <button className='p-5 bg-black text-white mt-5' onClick={handleClick}>
        Subscribe
      </button>
    </div>
  );
};

export default CheckoutForm;
