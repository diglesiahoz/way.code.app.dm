import { test, expect } from '@playwright/test';

/**
 * E2E genéricos del stack Drupal (sin acoplarse a un tema concreto).
 */
test.describe('Drupal stack', () => {
  test('La portada responde', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  });
  test('Formulario de login', async ({ page }) => {
    const login = await page.goto('/user/login');
    expect(login?.ok()).toBeTruthy();
    await expect(page.locator('form#user-login-form')).toBeVisible({ timeout: 20000 });
  });
});
