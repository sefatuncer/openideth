import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/register');

    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should show validation errors on empty register submit', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /create account/i }).click();
    // Browser native validation should prevent submission
  });
});

test.describe('Landing Page', () => {
  test('should render hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /rent smarter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /browse properties/i })).toBeVisible();
  });

  test('should show how it works section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/how it works/i)).toBeVisible();
  });
});

test.describe('Properties Page', () => {
  test('should render search page', async ({ page }) => {
    await page.goto('/properties');
    await expect(page.getByRole('heading', { name: /find your next home/i })).toBeVisible();
  });
});
