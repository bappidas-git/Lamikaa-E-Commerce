import { copyToClipboard } from "./helpers";

// =============================================================================
// copyToClipboard — the write behind every Copy button
// =============================================================================
// The helper used to be `navigator.clipboard.writeText` and nothing else. That
// API exists only on HTTPS (or localhost), so a storefront opened over plain
// HTTP threw on every click and the voucher Copy buttons did nothing at all.
// These pin down the two writers and the promise the helper makes: `true` only
// when the text really went to the clipboard, and the page left as it was.
//
// jsdom has neither writer, so each test installs the ones it is about. The
// stand-in `execCommand` behaves like a browser's: it fires a cancellable
// `copy` event at the selection, and copies the selected text unless a
// listener wrote clipboardData itself.
// =============================================================================

let written;

const installApi = (writeText) => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
};

const installExecCommand = ({ result = true, throws = false } = {}) => {
  document.execCommand = jest.fn((command) => {
    if (throws) throw new Error("SecurityError");
    if (command !== "copy" || !result) return false;
    const selection = document.getSelection();
    const event = new Event("copy", { bubbles: true, cancelable: true });
    event.clipboardData = { setData: jest.fn((type, data) => (written = { type, data })) };
    const target = selection.anchorNode?.parentElement || document.body;
    if (target.dispatchEvent(event)) {
      written = { type: "selection", data: selection.toString() };
    }
    return true;
  });
};

beforeEach(() => {
  written = undefined;
  document.body.innerHTML = "";
  document.getSelection().removeAllRanges();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete navigator.clipboard;
  delete document.execCommand;
  console.error.mockRestore();
});

describe("copyToClipboard", () => {
  it("uses the Clipboard API where the page has one", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    installApi(writeText);
    installExecCommand();

    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("SAMPLE10");
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  // The reported bug: no `navigator.clipboard` on a plain-HTTP page.
  it("still copies where there is no Clipboard API", async () => {
    installExecCommand();

    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    // Exactly the code, as plain text, not the throwaway node's markup.
    expect(written).toEqual({ type: "text/plain", data: "SAMPLE10" });
  });

  // execCommand only works inside the click's user activation, so nothing may
  // be awaited ahead of it.
  it("copies inside the click itself, before anything is awaited", () => {
    installExecCommand();

    const pending = copyToClipboard("SAMPLE10");
    expect(document.execCommand).toHaveBeenCalledTimes(1);
    return expect(pending).resolves.toBe(true);
  });

  it("falls back when the Clipboard API refuses", async () => {
    installApi(jest.fn().mockRejectedValue(new Error("Document is not focused.")));
    installExecCommand();

    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(true);
    expect(written).toEqual({ type: "text/plain", data: "SAMPLE10" });
  });

  it("copies the selected text where the copy event carries no clipboardData", async () => {
    document.execCommand = jest.fn(() => {
      written = { type: "selection", data: document.getSelection().toString() };
      return true;
    });

    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(true);
    expect(written).toEqual({ type: "selection", data: "SAMPLE10" });
  });

  it("says false, never a false 'Copied', when nothing could copy", async () => {
    installApi(jest.fn().mockRejectedValue(new Error("NotAllowedError")));
    installExecCommand({ result: false });
    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(false);

    delete navigator.clipboard;
    installExecCommand({ throws: true });
    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(false);

    // A browser with neither writer at all.
    delete document.execCommand;
    await expect(copyToClipboard("SAMPLE10")).resolves.toBe(false);
    expect(written).toBeUndefined();
  });

  it("leaves the page as it found it", async () => {
    document.body.innerHTML =
      '<p id="picked">Codes You Can Use</p><button type="button">Copy</button>';
    const button = document.querySelector("button");
    button.focus();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("picked"));
    document.getSelection().addRange(range);
    installExecCommand();

    await copyToClipboard("SAMPLE10");

    expect(document.body.children).toHaveLength(2);
    expect(document.getSelection().toString()).toBe("Codes You Can Use");
    expect(document.activeElement).toBe(button);

    // The helper's own copy listener is gone: a later copy by the visitor is
    // the browser's business again.
    const event = new Event("copy", { bubbles: true, cancelable: true });
    event.clipboardData = { setData: jest.fn() };
    document.body.dispatchEvent(event);
    expect(event.clipboardData.setData).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("copies a numeric code as its text, and nothing at all for an empty one", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    installApi(writeText);

    await expect(copyToClipboard(101010)).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("101010");

    writeText.mockClear();
    await expect(copyToClipboard("")).resolves.toBe(false);
    await expect(copyToClipboard(null)).resolves.toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
