import { test } from "node:test";
import { Application } from "@fastr/core";
import { User } from "@keybr/database";
import { isPremiumUser } from "@keybr/pages-shared";
import { equal, isFalse, isTrue, like } from "rich-assert";
import { kMain } from "../module.ts";
import { TestContext } from "../test/context.ts";
import { startApp } from "../test/request.ts";

const context = new TestContext();

test("ignore invalid http method", async () => {
  // Arrange.

  const request = startApp(context.get(Application, kMain));

  // Assert.

  equal((await request.GET("/_/checkout/paddle-alert").send()).status, 405);
  equal((await request.PUT("/_/checkout/paddle-alert").send({})).status, 405);
  equal(
    (await request.DELETE("/_/checkout/paddle-alert").send({})).status,
    405,
  );
});

test("ignore wrong signature", async () => {
  // Arrange.

  const request = startApp(context.get(Application, kMain));

  // Act.

  const response = await request //
    .POST("/_/checkout/paddle-alert")
    .send(
      new URLSearchParams([
        ["alert_id", "612116857"],
        ["alert_name", "payment_succeeded"],
        ["balance_currency", "USD"],
        ["balance_earnings", "271.88"],
        ["balance_fee", "629.46"],
        ["balance_gross", "507.41"],
        ["balance_tax", "507.71"],
        ["checkout_id", "4-b4c87772e660c77-7f4ac5922d"],
        ["country", "PL"],
        ["coupon", ""],
        ["currency", "PLN"],
        ["customer_name", "Joe Doe"],
        ["earnings", "10"],
        ["email", "user@keybr.com"],
        ["event_time", "2020-12-18 13:19:04"],
        ["fee", "2"],
        ["ip", "182.101.30.193"],
        ["marketing_consent", "1"],
        ["order_id", "7"],
        ["passthrough", `{"id":"55vdtk1"}`],
        ["payment_method", "card"],
        ["payment_tax", "5"],
        ["product_id", "1"],
        ["product_name", "Product Name"],
        ["quantity", "1"],
        [
          "receipt_url",
          "https://my.paddle.com/receipt/3/17e69ab2944a5b1-bf0dedae7e",
        ],
        ["sale_gross", "20"],
        ["used_price_override", "false"],
        ["p_signature", "wtf"],
      ]),
    );

  // Assert.

  equal(response.status, 403);
  equal(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  equal(
    await response.body.text(),
    "Error: Failed validating webhook event body",
  );

  isFalse(isPremiumUser(User.toPublicUser(await User.findById(1), "")));
});

test("ignore invalid user id", async () => {
  // Arrange.

  const request = startApp(context.get(Application, kMain));

  // Act.

  const response = await request //
    .POST("/_/checkout/paddle-alert")
    .send(
      new URLSearchParams([
        ["alert_id", "949604903"],
        ["alert_name", "payment_succeeded"],
        ["balance_currency", "EUR"],
        ["balance_earnings", "712.81"],
        ["balance_fee", "388.69"],
        ["balance_gross", "334.49"],
        ["balance_tax", "923.08"],
        ["checkout_id", "2-17f93593619ee5c-027efff3f9"],
        ["country", "DE"],
        ["coupon", ""],
        ["currency", "EUR"],
        ["customer_name", "Joe Doe"],
        ["earnings", "12.34"],
        ["email", "user@keybr.com"],
        ["event_time", "2020-12-18 15:54:40"],
        ["fee", "22.11"],
        ["ip", "21.248.165.193"],
        ["marketing_consent", "0"],
        ["order_id", "9"],
        ["passthrough", '{"id":"z1qfg4b"}'],
        ["payment_method", "card"],
        ["payment_tax", "11.22"],
        ["product_id", "1"],
        ["product_name", "Product Name"],
        ["quantity", "1"],
        [
          "receipt_url",
          "https://my.paddle.com/receipt/2/8c7fd29530832ef-07260a5ee9",
        ],
        ["sale_gross", "43.21"],
        ["used_price_override", "false"],
        [
          "p_signature",
          "VS4z/3/5SZPmPSys7QvRGYzjFEDKX37E9l0i8rE2/GOkA8/FFOvec+PGEttk/qwlxC6fc1/TPgq7E1OtknbUQg==",
        ],
      ]),
    );

  // Assert.

  equal(response.status, 500);
  equal(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  equal(await response.body.text(), "Error: Unknown user id");
});

test("create order", async () => {
  // Arrange.

  const request = startApp(context.get(Application, kMain));

  // Act.

  const response = await request //
    .POST("/_/checkout/paddle-alert")
    .send(
      new URLSearchParams([
        ["alert_id", "612116857"],
        ["alert_name", "payment_succeeded"],
        ["balance_currency", "USD"],
        ["balance_earnings", "271.88"],
        ["balance_fee", "629.46"],
        ["balance_gross", "507.41"],
        ["balance_tax", "507.71"],
        ["checkout_id", "4-b4c87772e660c77-7f4ac5922d"],
        ["country", "PL"],
        ["coupon", ""],
        ["currency", "PLN"],
        ["customer_name", "Joe Doe"],
        ["earnings", "10"],
        ["email", "user@keybr.com"],
        ["event_time", "2020-12-18 13:19:04"],
        ["fee", "2"],
        ["ip", "182.101.30.193"],
        ["marketing_consent", "1"],
        ["order_id", "7"],
        ["passthrough", `{"id":"55vdtk1"}`],
        ["payment_method", "card"],
        ["payment_tax", "5"],
        ["product_id", "1"],
        ["product_name", "Product Name"],
        ["quantity", "1"],
        [
          "receipt_url",
          "https://my.paddle.com/receipt/3/17e69ab2944a5b1-bf0dedae7e",
        ],
        ["sale_gross", "20"],
        ["used_price_override", "false"],
        [
          "p_signature",
          "G6TKK3+vow5D+4fuYrnrBg2773BSGdDbvavqJQaEaxo+dOswvCZ1+IRZ/OI1y0SBofZOcsui5HC7FrWTov7luA==",
        ],
      ]),
    );

  // Assert.

  equal(response.status, 200);
  equal(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  equal(await response.body.text(), "OK");

  isTrue(isPremiumUser(User.toPublicUser(await User.findById(1), "")));
});

test("re-create order", async () => {
  // Arrange.

  await (await User.findById(1))!.$relatedQuery("order").insert({
    provider: "paddle",
    id: "dummy1",
    createdAt: new Date(),
    name: null,
    email: null,
  });
  await (await User.findById(2))!.$relatedQuery("order").insert({
    provider: "paddle",
    id: "dummy2",
    createdAt: new Date(),
    name: null,
    email: null,
  });

  const request = startApp(context.get(Application, kMain));

  // Act.

  const response = await request //
    .POST("/_/checkout/paddle-alert")
    .send(
      new URLSearchParams([
        ["alert_id", "612116857"],
        ["alert_name", "payment_succeeded"],
        ["balance_currency", "USD"],
        ["balance_earnings", "271.88"],
        ["balance_fee", "629.46"],
        ["balance_gross", "507.41"],
        ["balance_tax", "507.71"],
        ["checkout_id", "4-b4c87772e660c77-7f4ac5922d"],
        ["country", "PL"],
        ["coupon", ""],
        ["currency", "PLN"],
        ["customer_name", "Joe Doe"],
        ["earnings", "10"],
        ["email", "user@keybr.com"],
        ["event_time", "2020-12-18 13:19:04"],
        ["fee", "2"],
        ["ip", "182.101.30.193"],
        ["marketing_consent", "1"],
        ["order_id", "7"],
        ["passthrough", `{"id":"55vdtk1"}`],
        ["payment_method", "card"],
        ["payment_tax", "5"],
        ["product_id", "1"],
        ["product_name", "Product Name"],
        ["quantity", "1"],
        [
          "receipt_url",
          "https://my.paddle.com/receipt/3/17e69ab2944a5b1-bf0dedae7e",
        ],
        ["sale_gross", "20"],
        ["used_price_override", "false"],
        [
          "p_signature",
          "G6TKK3+vow5D+4fuYrnrBg2773BSGdDbvavqJQaEaxo+dOswvCZ1+IRZ/OI1y0SBofZOcsui5HC7FrWTov7luA==",
        ],
      ]),
    );

  // Assert.

  equal(response.status, 200);
  equal(response.headers.get("Content-Type"), "text/plain; charset=UTF-8");
  equal(await response.body.text(), "OK");

  const user1 = (await User.findById(1))!;
  const user2 = (await User.findById(2))!;

  isTrue(isPremiumUser(User.toPublicUser(user1, "")));
  isTrue(isPremiumUser(User.toPublicUser(user2, "")));

  like(user1.toJSON(), {
    id: 1,
    order: {
      provider: "paddle",
      id: "4-b4c87772e660c77-7f4ac5922d",
      name: "Joe Doe",
      email: "user@keybr.com",
      userId: 1,
    },
  });
  like(user2.toJSON(), {
    id: 2,
    order: {
      provider: "paddle",
      id: "dummy2",
      name: null,
      email: null,
      userId: 2,
    },
  });
});
