import { describe, it, expect } from 'vitest';
import { transformWardrobeData, transformOrderData, transformDropData } from './transformers';
import { Carrier, TrackingStatus } from '../models/types';

describe('Data Transformers (Backend Logic)', () => {
  
  describe('transformWardrobeData', () => {
    it('correctly maps DB fields to frontend model', () => {
      const mockDbData = [{
        id: 123,
        name: 'Test Shirt',
        brand: 'Test Brand',
        category: 'Tops',
        image_url: 'http://example.com/img.png',
        date_added: '2023-01-01T12:00:00Z',
        color: 'Blue'
      }];

      const result = transformWardrobeData(mockDbData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('123'); // Should convert number to string
      expect(result[0].imageUrl).toBe('http://example.com/img.png'); // CamelCase check
      expect(result[0].dateAdded).toBe('2023-01-01'); // Date formatting check
    });

    it('handles missing dates by defaulting to today', () => {
      const mockDbData = [{ id: 1, date_added: null }];
      const result = transformWardrobeData(mockDbData);
      // Check if it returns a valid date string YYYY-MM-DD
      expect(result[0].dateAdded).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('transformOrderData', () => {
    it('formats estimated delivery correctly', () => {
      const mockOrders = [{
        id: 'abc',
        tracking_number: '12345',
        carrier: Carrier.UPS,
        item_name: 'Sneakers',
        status: TrackingStatus.IN_TRANSIT,
        estimated_delivery: '2023-12-25T10:00:00Z',
        history: []
      }];

      const result = transformOrderData(mockOrders);
      expect(result[0].estimatedDelivery).not.toBe('Pending');
      // Exact string depends on locale, but should not be ISO
      expect(result[0].estimatedDelivery).not.toContain('T10:00:00Z'); 
    });

    it('defaults estimated delivery to Pending if null', () => {
      const mockOrders = [{ id: 'abc', estimated_delivery: null }];
      const result = transformOrderData(mockOrders);
      expect(result[0].estimatedDelivery).toBe('Pending');
    });
  });

  describe('transformDropData', () => {
    it('splits datetime into date and time components', () => {
      // Create a specific date time: 2023-10-31 14:30
      const mockDrops = [{
        id: 1,
        drop_datetime: '2023-10-31T14:30:00Z',
        brand: 'Nike',
        name: 'Dunk',
        image_url: 'img',
        notified: true
      }];

      const result = transformDropData(mockDrops);
      expect(result[0].date).toBe('2023-10-31');
      // Time check might vary by test runner timezone, but field should exist
      expect(result[0].time).toBeDefined();
    });
  });
});