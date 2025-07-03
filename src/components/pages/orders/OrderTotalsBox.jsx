import React from 'react';

export default function OrderTotalsBox({ totals, discountPercent, setDiscountPercent }) {
  const { subtotal, discountValue, total } = totals;  
  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-6 mt-8 justify-end"
      key={`totalsbox-${subtotal}-${discountValue}-${total}`}
    >
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl shadow-md p-6 w-full sm:w-auto min-w-[320px] max-w-md">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Subtotal</span>
            <span className="text-lg font-semibold text-gray-900">${subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="discountPercent" className="font-semibold text-gray-700">Descuento</label>
            <div className="flex items-center gap-2">
              <input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || (/^\d{0,3}$/.test(val) && Number(val) <= 100)) {
                    setDiscountPercent(val);
                  }
                }}
                onBlur={e => {
                  if (e.target.value === '' || isNaN(Number(e.target.value))) {
                    setDiscountPercent('0');
                  }
                }}
                className="w-16 border border-blue-200 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-300 transition"
              />
              <span className="text-gray-500 font-medium">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Valor descuento</span>
            <span className="text-green-700 font-semibold">-${discountValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="border-t border-blue-100 my-2"></div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-800 text-lg">Total a pagar</span>
            <span className="text-2xl font-bold text-blue-700">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
