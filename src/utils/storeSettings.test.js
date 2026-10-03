import { fillStoreCopy, normalizeStoreSettings } from "./storeSettings";

// The contact tokens in policy and FAQ copy follow Settings > General: filled
// once the owner saves a value, and still taking their sentence off the page
// while the field holds only its {{TOKEN}}.
describe("fillStoreCopy — contact tokens", () => {
  const copy =
    "We answer every message. Write to {{LAMIKAA_EMAIL}} or call {{LAMIKAA_PHONE}}. Post to {{LAMIKAA_ADDRESS}}.";

  it("fills email, phone and address from the saved settings", () => {
    const settings = normalizeStoreSettings({
      store: {
        email: "care@lamikaa.in",
        phone: "+91 98765 43210",
        address: "Bokakhat, Assam",
      },
    });
    expect(fillStoreCopy(copy, settings)).toBe(
      "We answer every message. Write to care@lamikaa.in or call +91 98765 43210. Post to Bokakhat, Assam."
    );
  });

  it("drops the sentence when the field is still a placeholder", () => {
    const settings = normalizeStoreSettings({
      store: {
        email: "{{LAMIKAA_EMAIL}}",
        phone: "{{LAMIKAA_PHONE}}",
        address: "Bokakhat, Assam",
      },
    });
    expect(fillStoreCopy(copy, settings)).toBe(
      "We answer every message. Post to Bokakhat, Assam."
    );
  });
});
