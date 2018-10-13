import { index, WhenMock } from "./when";
import * as utils from "expect/build/jasmine_utils";

const errMsg = ({ expect, actual }) =>
  new RegExp(`Expected.*\\n.*${expect}.*\\nReceived.*\\n.*${actual}`);

describe("When", () => {
  describe("when", () => {
    it("returns a WhenMock", () => {
      const fn = jest.fn();
      const whenFn = index(fn);

      expect(whenFn).toBeInstanceOf(WhenMock);
      expect(whenFn.fn).toBe(fn);
      expect(whenFn.debug).toBe(false);
    });

    it("returns existing WhenMock if fn was already whenified", () => {
      const fn = jest.fn();
      const whenFn1 = index(fn);
      const whenFn2 = index(fn);

      expect(whenFn1).toBeInstanceOf(WhenMock);
      expect(whenFn2).toBeInstanceOf(WhenMock);
      expect(whenFn1).toBe(whenFn2);
    });

    it('can be reset via `mockReset`', () => {
      const fn = jest.fn()

      index(fn).calledWith(1).mockReturnValue('return 1')
      expect(fn(1)).toEqual('return 1')

      fn.mockReset()
      expect(fn(1)).toBeUndefined()

      // when(fn).calledWith(1).mockReturnValue('return 2')
      // expect(fn(1)).toEqual('return 2')
    })
  });

  describe("mock implementation", () => {
    it("offloads equality check to jasmine equals helper", () => {
      const fn = jest.fn();

      jest.spyOn(utils, "equals");

      index(fn)
        .calledWith(1)
        .mockReturnValue("x");

      expect(fn(1)).toEqual("x");
      expect(utils.equals).toBeCalledWith(1, 1);

      expect(fn(2)).toEqual(undefined);
      expect(utils.equals).toBeCalledWith(2, 1);
    });

    it("works with multiple args", () => {
      const fn = jest.fn();

      jest.spyOn(utils, "equals");

      const anyString = expect.any(String);

      index(fn)
        .calledWith(1, "foo", true, anyString, undefined)
        .mockReturnValue("x");

      expect(fn(1, "foo", true, "whatever")).toEqual("x");
      expect(utils.equals).toBeCalledWith(1, 1);
      expect(utils.equals).toBeCalledWith("foo", "foo");
      expect(utils.equals).toBeCalledWith(true, true);
      expect(utils.equals).toBeCalledWith("whatever", anyString);
      expect(utils.equals).toBeCalledWith(undefined, undefined);
    });

    it("supports compound when declarations", () => {
      const fn = jest.fn();

      jest.spyOn(utils, "equals");

      index(fn)
        .calledWith(1)
        .mockReturnValue("x");
      index(fn)
        .calledWith("foo", "bar")
        .mockReturnValue("y");
      index(fn)
        .calledWith(false, /asdf/g)
        .mockReturnValue("z");

      expect(fn(1)).toEqual("x");
      expect(fn("foo", "bar")).toEqual("y");
      expect(fn(false, /asdf/g)).toEqual("z");
    });

    it("should log if debug is enabled", () => {
      const fn = jest.fn();
      console.log = jest.fn();

      const whenFn = index(fn, { debug: true });
      whenFn.calledWith(1).mockReturnValue("x");

      fn(1);

      expect(whenFn.debug).toBeTruthy();
      expect(console.log).toHaveBeenCalledTimes(4);
    });

    it("mockReturnValue: returns a declared value repeatedly", () => {
      const fn = jest.fn();

      index(fn)
        .calledWith(1)
        .mockReturnValue("x");

      expect(fn(1)).toEqual("x");
      expect(fn(1)).toEqual("x");
      expect(fn(1)).toEqual("x");
    });

    it("expectCalledWith: fails a test with error messaging if argument does not match", () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();

      index(fn1)
        .expectCalledWith(1)
        .mockReturnValue("x");
      index(fn2)
        .calledWith("foo")
        .mockReturnValue("y");

      expect(() => fn1(2)).toThrow(errMsg({ expect: 1, actual: 2 }));
      expect(() => fn2("bar")).not.toThrow();
    });

    it("mockReturnValueOnce: should return specified value only once", () => {
      const fn = jest.fn();

      index(fn)
        .calledWith("foo")
        .mockReturnValueOnce("bar");
      index(fn)
        .calledWith("foo")
        .mockReturnValueOnce("cbs");

      expect(fn("foo")).toEqual("bar");
      expect(fn("foo")).toEqual("cbs");
      expect(fn("foo")).toBeUndefined();
    });

    it("mockResolvedValue: should return a Promise multiple times", async () => {
      const fn = jest.fn();

      index(fn)
        .calledWith("foo")
        .mockResolvedValue("bar");

      // expect(fn('foo').then).toBe(Function())
      expect(fn("foo")).resolves.toEqual("bar");
      expect(fn("foo")).resolves.toEqual("bar");
    });

    it("mockResolvedValueOnce: should return a Promise only once", async () => {
      const fn = jest.fn();

      index(fn)
        .calledWith("foo")
        .mockResolvedValueOnce("bar");
      index(fn)
        .calledWith("foo")
        .mockResolvedValueOnce("cbs");

      // expect(fn('foo').then).toBe(Function())
      expect(fn("foo")).resolves.toEqual("bar");
      expect(fn("foo")).resolves.toEqual("cbs");
      expect(fn("foo")).toBeUndefined();
    });
  });
});
