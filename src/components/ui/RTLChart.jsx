import React from 'react';
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * RTL-aware chart component that flips for Arabic
 */
export default function RTLChart({ data, dataKey, xKey, ...props }) {
  const { isRTL } = useLanguage();

  // Reverse data for RTL
  const chartData = isRTL ? [...data].reverse() : data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout={isRTL ? 'horizontal' : 'vertical'}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} reversed={isRTL} />
        <YAxis reversed={isRTL} />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}