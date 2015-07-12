require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (Buffer){
!function(factory) {
    var global = this;
    module.exports = factory(global);
}(function(global) {
    "use strict";
    function is(obj, Ctor) {
        return "object" != typeof obj || null === obj ? !1 : obj.constructor === Ctor || Object.prototype.toString.call(obj) === "[object " + Ctor.name + "]";
    }
    function arrayFrom(arrayLike, forceCopy) {
        return !forceCopy && is(arrayLike, Array) ? arrayLike : Array.prototype.slice.call(arrayLike);
    }
    function defined(value, defaultValue) {
        return void 0 !== value ? value : defaultValue;
    }
    function jDataView(buffer, byteOffset, byteLength, littleEndian) {
        if (jDataView.is(buffer)) {
            var result = buffer.slice(byteOffset, byteOffset + byteLength);
            return result._littleEndian = defined(littleEndian, result._littleEndian), result;
        }
        if (!jDataView.is(this)) return new jDataView(buffer, byteOffset, byteLength, littleEndian);
        if (this.buffer = buffer = jDataView.wrapBuffer(buffer), this._isArrayBuffer = compatibility.ArrayBuffer && is(buffer, ArrayBuffer), 
        this._isPixelData = !1, this._isDataView = compatibility.DataView && this._isArrayBuffer, 
        this._isNodeBuffer = !0 && compatibility.NodeBuffer && is(buffer, Buffer), !this._isNodeBuffer && !this._isArrayBuffer && !is(buffer, Array)) throw new TypeError("jDataView buffer has an incompatible type");
        this._littleEndian = !!littleEndian;
        var bufferLength = "byteLength" in buffer ? buffer.byteLength : buffer.length;
        this.byteOffset = byteOffset = defined(byteOffset, 0), this.byteLength = byteLength = defined(byteLength, bufferLength - byteOffset), 
        this._offset = this._bitOffset = 0, this._isDataView ? this._view = new DataView(buffer, byteOffset, byteLength) : this._checkBounds(byteOffset, byteLength, bufferLength), 
        this._engineAction = this._isDataView ? this._dataViewAction : this._isNodeBuffer ? this._nodeBufferAction : this._isArrayBuffer ? this._arrayBufferAction : this._arrayAction;
    }
    function getCharCodes(string) {
        if (compatibility.NodeBuffer) return new Buffer(string, "binary");
        for (var Type = compatibility.ArrayBuffer ? Uint8Array : Array, codes = new Type(string.length), i = 0, length = string.length; length > i; i++) codes[i] = 255 & string.charCodeAt(i);
        return codes;
    }
    function pow2(n) {
        return n >= 0 && 31 > n ? 1 << n : pow2[n] || (pow2[n] = Math.pow(2, n));
    }
    function Uint64(lo, hi) {
        this.lo = lo, this.hi = hi;
    }
    function Int64() {
        Uint64.apply(this, arguments);
    }
    var compatibility = {
        NodeBuffer: !0 && "Buffer" in global,
        DataView: "DataView" in global,
        ArrayBuffer: "ArrayBuffer" in global,
        PixelData: !1
    }, TextEncoder = global.TextEncoder, TextDecoder = global.TextDecoder;
    compatibility.NodeBuffer && !function(buffer) {
        try {
            buffer.writeFloatLE(1/0, 0);
        } catch (e) {
            compatibility.NodeBuffer = !1;
        }
    }(new Buffer(4));
    var dataTypes = {
        Int8: 1,
        Int16: 2,
        Int32: 4,
        Uint8: 1,
        Uint16: 2,
        Uint32: 4,
        Float32: 4,
        Float64: 8
    };
    jDataView.wrapBuffer = function(buffer) {
        switch (typeof buffer) {
          case "number":
            if (compatibility.NodeBuffer) buffer = new Buffer(buffer), buffer.fill(0); else if (compatibility.ArrayBuffer) buffer = new Uint8Array(buffer).buffer; else {
                buffer = new Array(buffer);
                for (var i = 0; i < buffer.length; i++) buffer[i] = 0;
            }
            return buffer;

          case "string":
            buffer = getCharCodes(buffer);

          default:
            return "length" in buffer && !(compatibility.NodeBuffer && is(buffer, Buffer) || compatibility.ArrayBuffer && is(buffer, ArrayBuffer)) && (compatibility.NodeBuffer ? buffer = new Buffer(buffer) : compatibility.ArrayBuffer ? is(buffer, ArrayBuffer) || (buffer = new Uint8Array(buffer).buffer, 
            is(buffer, ArrayBuffer) || (buffer = new Uint8Array(arrayFrom(buffer, !0)).buffer)) : buffer = arrayFrom(buffer)), 
            buffer;
        }
    }, jDataView.is = function(view) {
        return view && view.jDataView;
    }, jDataView.from = function() {
        return new jDataView(arguments);
    }, jDataView.Uint64 = Uint64, Uint64.prototype = {
        valueOf: function() {
            return this.lo + pow2(32) * this.hi;
        },
        toString: function() {
            return Number.prototype.toString.apply(this.valueOf(), arguments);
        }
    }, Uint64.fromNumber = function(number) {
        var hi = Math.floor(number / pow2(32)), lo = number - hi * pow2(32);
        return new Uint64(lo, hi);
    }, jDataView.Int64 = Int64, Int64.prototype = "create" in Object ? Object.create(Uint64.prototype) : new Uint64(), 
    Int64.prototype.valueOf = function() {
        return this.hi < pow2(31) ? Uint64.prototype.valueOf.apply(this, arguments) : -(pow2(32) - this.lo + pow2(32) * (pow2(32) - 1 - this.hi));
    }, Int64.fromNumber = function(number) {
        var lo, hi;
        if (number >= 0) {
            var unsigned = Uint64.fromNumber(number);
            lo = unsigned.lo, hi = unsigned.hi;
        } else hi = Math.floor(number / pow2(32)), lo = number - hi * pow2(32), hi += pow2(32);
        return new Int64(lo, hi);
    };
    var proto = jDataView.prototype = {
        compatibility: compatibility,
        jDataView: !0,
        _checkBounds: function(byteOffset, byteLength, maxLength) {
            if ("number" != typeof byteOffset) throw new TypeError("Offset is not a number.");
            if ("number" != typeof byteLength) throw new TypeError("Size is not a number.");
            if (0 > byteLength) throw new RangeError("Length is negative.");
            if (0 > byteOffset || byteOffset + byteLength > defined(maxLength, this.byteLength)) throw new RangeError("Offsets are out of bounds.");
        },
        _action: function(type, isReadAction, byteOffset, littleEndian, value) {
            return this._engineAction(type, isReadAction, defined(byteOffset, this._offset), defined(littleEndian, this._littleEndian), value);
        },
        _dataViewAction: function(type, isReadAction, byteOffset, littleEndian, value) {
            return this._offset = byteOffset + dataTypes[type], isReadAction ? this._view["get" + type](byteOffset, littleEndian) : this._view["set" + type](byteOffset, value, littleEndian);
        },
        _arrayBufferAction: function(type, isReadAction, byteOffset, littleEndian, value) {
            var typedArray, size = dataTypes[type], TypedArray = global[type + "Array"];
            if (littleEndian = defined(littleEndian, this._littleEndian), 1 === size || (this.byteOffset + byteOffset) % size === 0 && littleEndian) return typedArray = new TypedArray(this.buffer, this.byteOffset + byteOffset, 1), 
            this._offset = byteOffset + size, isReadAction ? typedArray[0] : typedArray[0] = value;
            var bytes = new Uint8Array(isReadAction ? this.getBytes(size, byteOffset, littleEndian, !0) : size);
            return typedArray = new TypedArray(bytes.buffer, 0, 1), isReadAction ? typedArray[0] : (typedArray[0] = value, 
            void this._setBytes(byteOffset, bytes, littleEndian));
        },
        _arrayAction: function(type, isReadAction, byteOffset, littleEndian, value) {
            return isReadAction ? this["_get" + type](byteOffset, littleEndian) : this["_set" + type](byteOffset, value, littleEndian);
        },
        _getBytes: function(length, byteOffset, littleEndian) {
            littleEndian = defined(littleEndian, this._littleEndian), byteOffset = defined(byteOffset, this._offset), 
            length = defined(length, this.byteLength - byteOffset), this._checkBounds(byteOffset, length), 
            byteOffset += this.byteOffset, this._offset = byteOffset - this.byteOffset + length;
            var result = this._isArrayBuffer ? new Uint8Array(this.buffer, byteOffset, length) : (this.buffer.slice || Array.prototype.slice).call(this.buffer, byteOffset, byteOffset + length);
            return littleEndian || 1 >= length ? result : arrayFrom(result).reverse();
        },
        getBytes: function(length, byteOffset, littleEndian, toArray) {
            var result = this._getBytes(length, byteOffset, defined(littleEndian, !0));
            return toArray ? arrayFrom(result) : result;
        },
        _setBytes: function(byteOffset, bytes, littleEndian) {
            var length = bytes.length;
            if (0 !== length) {
                if (littleEndian = defined(littleEndian, this._littleEndian), byteOffset = defined(byteOffset, this._offset), 
                this._checkBounds(byteOffset, length), !littleEndian && length > 1 && (bytes = arrayFrom(bytes, !0).reverse()), 
                byteOffset += this.byteOffset, this._isArrayBuffer) new Uint8Array(this.buffer, byteOffset, length).set(bytes); else if (this._isNodeBuffer) new Buffer(bytes).copy(this.buffer, byteOffset); else for (var i = 0; length > i; i++) this.buffer[byteOffset + i] = bytes[i];
                this._offset = byteOffset - this.byteOffset + length;
            }
        },
        setBytes: function(byteOffset, bytes, littleEndian) {
            this._setBytes(byteOffset, bytes, defined(littleEndian, !0));
        },
        getString: function(byteLength, byteOffset, encoding) {
            if (this._isNodeBuffer) return byteOffset = defined(byteOffset, this._offset), byteLength = defined(byteLength, this.byteLength - byteOffset), 
            this._checkBounds(byteOffset, byteLength), this._offset = byteOffset + byteLength, 
            this.buffer.toString(encoding || "binary", this.byteOffset + byteOffset, this.byteOffset + this._offset);
            var bytes = this._getBytes(byteLength, byteOffset, !0);
            if (encoding = "utf8" === encoding ? "utf-8" : encoding || "binary", TextDecoder && "binary" !== encoding) return new TextDecoder(encoding).decode(this._isArrayBuffer ? bytes : new Uint8Array(bytes));
            var string = "";
            byteLength = bytes.length;
            for (var i = 0; byteLength > i; i++) string += String.fromCharCode(bytes[i]);
            return "utf-8" === encoding && (string = decodeURIComponent(escape(string))), string;
        },
        setString: function(byteOffset, subString, encoding) {
            if (this._isNodeBuffer) return byteOffset = defined(byteOffset, this._offset), this._checkBounds(byteOffset, subString.length), 
            void (this._offset = byteOffset + this.buffer.write(subString, this.byteOffset + byteOffset, encoding || "binary"));
            encoding = "utf8" === encoding ? "utf-8" : encoding || "binary";
            var bytes;
            TextEncoder && "binary" !== encoding ? bytes = new TextEncoder(encoding).encode(subString) : ("utf-8" === encoding && (subString = unescape(encodeURIComponent(subString))), 
            bytes = getCharCodes(subString)), this._setBytes(byteOffset, bytes, !0);
        },
        getChar: function(byteOffset) {
            return this.getString(1, byteOffset);
        },
        setChar: function(byteOffset, character) {
            this.setString(byteOffset, character);
        },
        tell: function() {
            return this._offset;
        },
        seek: function(byteOffset) {
            return this._checkBounds(byteOffset, 0), this._offset = byteOffset;
        },
        skip: function(byteLength) {
            return this.seek(this._offset + byteLength);
        },
        slice: function(start, end, forceCopy) {
            function normalizeOffset(offset, byteLength) {
                return 0 > offset ? offset + byteLength : offset;
            }
            return start = normalizeOffset(start, this.byteLength), end = normalizeOffset(defined(end, this.byteLength), this.byteLength), 
            forceCopy ? new jDataView(this.getBytes(end - start, start, !0, !0), void 0, void 0, this._littleEndian) : new jDataView(this.buffer, this.byteOffset + start, end - start, this._littleEndian);
        },
        alignBy: function(byteCount) {
            return this._bitOffset = 0, 1 !== defined(byteCount, 1) ? this.skip(byteCount - (this._offset % byteCount || byteCount)) : this._offset;
        },
        _getFloat64: function(byteOffset, littleEndian) {
            var b = this._getBytes(8, byteOffset, littleEndian), sign = 1 - 2 * (b[7] >> 7), exponent = ((b[7] << 1 & 255) << 3 | b[6] >> 4) - 1023, mantissa = (15 & b[6]) * pow2(48) + b[5] * pow2(40) + b[4] * pow2(32) + b[3] * pow2(24) + b[2] * pow2(16) + b[1] * pow2(8) + b[0];
            return 1024 === exponent ? 0 !== mantissa ? 0/0 : 1/0 * sign : -1023 === exponent ? sign * mantissa * pow2(-1074) : sign * (1 + mantissa * pow2(-52)) * pow2(exponent);
        },
        _getFloat32: function(byteOffset, littleEndian) {
            var b = this._getBytes(4, byteOffset, littleEndian), sign = 1 - 2 * (b[3] >> 7), exponent = (b[3] << 1 & 255 | b[2] >> 7) - 127, mantissa = (127 & b[2]) << 16 | b[1] << 8 | b[0];
            return 128 === exponent ? 0 !== mantissa ? 0/0 : 1/0 * sign : -127 === exponent ? sign * mantissa * pow2(-149) : sign * (1 + mantissa * pow2(-23)) * pow2(exponent);
        },
        _get64: function(Type, byteOffset, littleEndian) {
            littleEndian = defined(littleEndian, this._littleEndian), byteOffset = defined(byteOffset, this._offset);
            for (var parts = littleEndian ? [ 0, 4 ] : [ 4, 0 ], i = 0; 2 > i; i++) parts[i] = this.getUint32(byteOffset + parts[i], littleEndian);
            return this._offset = byteOffset + 8, new Type(parts[0], parts[1]);
        },
        getInt64: function(byteOffset, littleEndian) {
            return this._get64(Int64, byteOffset, littleEndian);
        },
        getUint64: function(byteOffset, littleEndian) {
            return this._get64(Uint64, byteOffset, littleEndian);
        },
        _getInt32: function(byteOffset, littleEndian) {
            var b = this._getBytes(4, byteOffset, littleEndian);
            return b[3] << 24 | b[2] << 16 | b[1] << 8 | b[0];
        },
        _getUint32: function(byteOffset, littleEndian) {
            return this._getInt32(byteOffset, littleEndian) >>> 0;
        },
        _getInt16: function(byteOffset, littleEndian) {
            return this._getUint16(byteOffset, littleEndian) << 16 >> 16;
        },
        _getUint16: function(byteOffset, littleEndian) {
            var b = this._getBytes(2, byteOffset, littleEndian);
            return b[1] << 8 | b[0];
        },
        _getInt8: function(byteOffset) {
            return this._getUint8(byteOffset) << 24 >> 24;
        },
        _getUint8: function(byteOffset) {
            return this._getBytes(1, byteOffset)[0];
        },
        _getBitRangeData: function(bitLength, byteOffset) {
            var startBit = (defined(byteOffset, this._offset) << 3) + this._bitOffset, endBit = startBit + bitLength, start = startBit >>> 3, end = endBit + 7 >>> 3, b = this._getBytes(end - start, start, !0), wideValue = 0;
            (this._bitOffset = 7 & endBit) && (this._bitOffset -= 8);
            for (var i = 0, length = b.length; length > i; i++) wideValue = wideValue << 8 | b[i];
            return {
                start: start,
                bytes: b,
                wideValue: wideValue
            };
        },
        getSigned: function(bitLength, byteOffset) {
            var shift = 32 - bitLength;
            return this.getUnsigned(bitLength, byteOffset) << shift >> shift;
        },
        getUnsigned: function(bitLength, byteOffset) {
            var value = this._getBitRangeData(bitLength, byteOffset).wideValue >>> -this._bitOffset;
            return 32 > bitLength ? value & ~(-1 << bitLength) : value;
        },
        _setBinaryFloat: function(byteOffset, value, mantSize, expSize, littleEndian) {
            var exponent, mantissa, signBit = 0 > value ? 1 : 0, eMax = ~(-1 << expSize - 1), eMin = 1 - eMax;
            0 > value && (value = -value), 0 === value ? (exponent = 0, mantissa = 0) : isNaN(value) ? (exponent = 2 * eMax + 1, 
            mantissa = 1) : 1/0 === value ? (exponent = 2 * eMax + 1, mantissa = 0) : (exponent = Math.floor(Math.log(value) / Math.LN2), 
            exponent >= eMin && eMax >= exponent ? (mantissa = Math.floor((value * pow2(-exponent) - 1) * pow2(mantSize)), 
            exponent += eMax) : (mantissa = Math.floor(value / pow2(eMin - mantSize)), exponent = 0));
            for (var b = []; mantSize >= 8; ) b.push(mantissa % 256), mantissa = Math.floor(mantissa / 256), 
            mantSize -= 8;
            for (exponent = exponent << mantSize | mantissa, expSize += mantSize; expSize >= 8; ) b.push(255 & exponent), 
            exponent >>>= 8, expSize -= 8;
            b.push(signBit << expSize | exponent), this._setBytes(byteOffset, b, littleEndian);
        },
        _setFloat32: function(byteOffset, value, littleEndian) {
            this._setBinaryFloat(byteOffset, value, 23, 8, littleEndian);
        },
        _setFloat64: function(byteOffset, value, littleEndian) {
            this._setBinaryFloat(byteOffset, value, 52, 11, littleEndian);
        },
        _set64: function(Type, byteOffset, value, littleEndian) {
            "object" != typeof value && (value = Type.fromNumber(value)), littleEndian = defined(littleEndian, this._littleEndian), 
            byteOffset = defined(byteOffset, this._offset);
            var parts = littleEndian ? {
                lo: 0,
                hi: 4
            } : {
                lo: 4,
                hi: 0
            };
            for (var partName in parts) this.setUint32(byteOffset + parts[partName], value[partName], littleEndian);
            this._offset = byteOffset + 8;
        },
        setInt64: function(byteOffset, value, littleEndian) {
            this._set64(Int64, byteOffset, value, littleEndian);
        },
        setUint64: function(byteOffset, value, littleEndian) {
            this._set64(Uint64, byteOffset, value, littleEndian);
        },
        _setUint32: function(byteOffset, value, littleEndian) {
            this._setBytes(byteOffset, [ 255 & value, value >>> 8 & 255, value >>> 16 & 255, value >>> 24 ], littleEndian);
        },
        _setUint16: function(byteOffset, value, littleEndian) {
            this._setBytes(byteOffset, [ 255 & value, value >>> 8 & 255 ], littleEndian);
        },
        _setUint8: function(byteOffset, value) {
            this._setBytes(byteOffset, [ 255 & value ]);
        },
        setUnsigned: function(byteOffset, value, bitLength) {
            var data = this._getBitRangeData(bitLength, byteOffset), wideValue = data.wideValue, b = data.bytes;
            wideValue &= ~(~(-1 << bitLength) << -this._bitOffset), wideValue |= (32 > bitLength ? value & ~(-1 << bitLength) : value) << -this._bitOffset;
            for (var i = b.length - 1; i >= 0; i--) b[i] = 255 & wideValue, wideValue >>>= 8;
            this._setBytes(data.start, b, !0);
        }
    }, nodeNaming = {
        Int8: "Int8",
        Int16: "Int16",
        Int32: "Int32",
        Uint8: "UInt8",
        Uint16: "UInt16",
        Uint32: "UInt32",
        Float32: "Float",
        Float64: "Double"
    };
    proto._nodeBufferAction = function(type, isReadAction, byteOffset, littleEndian, value) {
        this._offset = byteOffset + dataTypes[type];
        var nodeName = nodeNaming[type] + ("Int8" === type || "Uint8" === type ? "" : littleEndian ? "LE" : "BE");
        return byteOffset += this.byteOffset, isReadAction ? this.buffer["read" + nodeName](byteOffset) : this.buffer["write" + nodeName](value, byteOffset);
    };
    for (var type in dataTypes) !function(type) {
        proto["get" + type] = function(byteOffset, littleEndian) {
            return this._action(type, !0, byteOffset, littleEndian);
        }, proto["set" + type] = function(byteOffset, value, littleEndian) {
            this._action(type, !1, byteOffset, littleEndian, value);
        };
    }(type);
    proto._setInt32 = proto._setUint32, proto._setInt16 = proto._setUint16, proto._setInt8 = proto._setUint8, 
    proto.setSigned = proto.setUnsigned;
    for (var method in proto) "set" === method.slice(0, 3) && !function(type) {
        proto["write" + type] = function() {
            Array.prototype.unshift.call(arguments, void 0), this["set" + type].apply(this, arguments);
        };
    }(method.slice(3));
    return jDataView;
});
}).call(this,require("buffer").Buffer)
},{"buffer":2}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Foo () {}
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    arr.constructor = Foo
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Foo && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined' && object.buffer instanceof ArrayBuffer) {
    return fromTypedArray(that, object)
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []
  var i = 0

  for (; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (leadSurrogate) {
        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        } else {
          // valid surrogate pair
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      } else {
        // no lead yet

        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else {
          // valid lead
          leadSurrogate = codePoint
          continue
        }
      }
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":3,"ieee754":4,"is-array":5}],3:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"nbt":[function(require,module,exports){
var dataview = require('jdataview');

// Generated by CoffeeScript 1.6.2
(function(global) {
  var NBTReader, TAG, TAG_Byte, TAG_Byte_Array, TAG_Compound, TAG_Double, TAG_End, TAG_Float, TAG_Int, TAG_Int_Array, TAG_List, TAG_Long, TAG_Short, TAG_String, TAG_Unknown, tags, _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };


  tags = {
    '_0': 'TAG_End',
    '_1': 'TAG_Byte',
    '_2': 'TAG_Short',
    '_3': 'TAG_Int',
    '_4': 'TAG_Long',
    '_5': 'TAG_Float',
    '_6': 'TAG_Double',
    '_7': 'TAG_Byte_Array',
    '_8': 'TAG_String',
    '_9': 'TAG_List',
    '_10': 'TAG_Compound',
    '_11': 'TAG_Int_Array'
  };

  TAG = (function() {
    function TAG(reader) {
      this.reader = reader;
      this.readName = __bind(this.readName, this);
    }

    TAG.prototype.readName = function() {
      var tagName;

      tagName = new TAG_String(this.reader);
      this.name = tagName.read();
      return this.name;
    };

    return TAG;

  })();

  TAG_End = (function(_super) {
    __extends(TAG_End, _super);

    function TAG_End() {
      this.read = __bind(this.read, this);
      this.readName = __bind(this.readName, this);      _ref = TAG_End.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TAG_End.prototype.readName = function() {
      return 'END';
    };

    TAG_End.prototype.read = function() {
      return '=END=';
    };

    return TAG_End;

  })(TAG);

  TAG_Unknown = (function(_super) {
    __extends(TAG_Unknown, _super);

    function TAG_Unknown() {
      this.read = __bind(this.read, this);      _ref1 = TAG_Unknown.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TAG_Unknown.prototype.read = function() {
      return 'unknown tag type';
    };

    return TAG_Unknown;

  })(TAG);

  TAG_Int = (function(_super) {
    __extends(TAG_Int, _super);

    function TAG_Int() {
      this.read = __bind(this.read, this);      _ref2 = TAG_Int.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    TAG_Int.prototype.read = function() {
      return this.reader.getInt32();
    };

    return TAG_Int;

  })(TAG);

  TAG_Float = (function(_super) {
    __extends(TAG_Float, _super);

    function TAG_Float() {
      this.read = __bind(this.read, this);      _ref3 = TAG_Float.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    TAG_Float.prototype.read = function() {
      return this.reader.getFloat32();
    };

    return TAG_Float;

  })(TAG);

  TAG_Double = (function(_super) {
    __extends(TAG_Double, _super);

    function TAG_Double() {
      this.read = __bind(this.read, this);      _ref4 = TAG_Double.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    TAG_Double.prototype.read = function() {
      return this.reader.getFloat64();
    };

    return TAG_Double;

  })(TAG);

  TAG_Byte = (function(_super) {
    __extends(TAG_Byte, _super);

    function TAG_Byte() {
      this.read = __bind(this.read, this);      _ref5 = TAG_Byte.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    TAG_Byte.prototype.read = function() {
      return this.reader.getInt8();
    };

    return TAG_Byte;

  })(TAG);

  TAG_Short = (function(_super) {
    __extends(TAG_Short, _super);

    function TAG_Short() {
      this.read = __bind(this.read, this);      _ref6 = TAG_Short.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    TAG_Short.prototype.read = function() {
      return this.reader.getInt16();
    };

    return TAG_Short;

  })(TAG);

  TAG_String = (function(_super) {
    __extends(TAG_String, _super);

    function TAG_String() {
      this.read = __bind(this.read, this);      _ref7 = TAG_String.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    TAG_String.prototype.read = function() {
      var length;

      if (this.reader == null) {
        return 0;
      }
      length = this.reader.getInt16();
      if (length === 0) {
        return '';
      } else {
        return this.reader.getString(length);
      }
    };

    return TAG_String;

  })(TAG);

  TAG_Long = (function(_super) {
    __extends(TAG_Long, _super);

    function TAG_Long() {
      this.read = __bind(this.read, this);      _ref8 = TAG_Long.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    TAG_Long.prototype.read = function() {
      return this.reader.getInt64();
    };

    return TAG_Long;

  })(TAG);

  TAG_List = (function(_super) {
    __extends(TAG_List, _super);

    function TAG_List() {
      this.read = __bind(this.read, this);      _ref9 = TAG_List.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    TAG_List.prototype.read = function() {
      var arr, i, length, tag, type, _i, _ref10;

      type = this.reader.getInt8();
      length = this.reader.getInt32();
      arr = [];
      if (length === 0) {
        return arr;
      }
      for (i = _i = 0, _ref10 = length - 1; 0 <= _ref10 ? _i <= _ref10 : _i >= _ref10; i = 0 <= _ref10 ? ++_i : --_i) {
        tag = this.reader.read(type);
        arr.push(tag);
      }
      return arr;
    };

    return TAG_List;

  })(TAG);

  TAG_Byte_Array = (function(_super) {
    __extends(TAG_Byte_Array, _super);

    function TAG_Byte_Array() {
      this.read = __bind(this.read, this);      _ref10 = TAG_Byte_Array.__super__.constructor.apply(this, arguments);
      return _ref10;
    }

    TAG_Byte_Array.prototype.read = function() {
      var arr, length, seekTo, type;

      type = 1;
      length = this.reader.getInt32();
      arr = new Uint8Array(this.reader.dataview.buffer, this.reader.dataview.tell(), length);
      seekTo = this.reader.dataview.tell() + length;
      this.reader.dataview.seek(seekTo);
      return arr;
    };

    return TAG_Byte_Array;

  })(TAG);

  TAG_Int_Array = (function(_super) {
    __extends(TAG_Int_Array, _super);

    function TAG_Int_Array() {
      this.read = __bind(this.read, this);      _ref11 = TAG_Int_Array.__super__.constructor.apply(this, arguments);
      return _ref11;
    }

    TAG_Int_Array.prototype.read = function() {
      var arr, i, length, type, _i, _ref12;

      type = 3;
      length = this.reader.getInt32();
      arr = [];
      for (i = _i = 0, _ref12 = length - 1; 0 <= _ref12 ? _i <= _ref12 : _i >= _ref12; i = 0 <= _ref12 ? ++_i : --_i) {
        arr.push(this.reader.getInt32());
      }
      return arr;
    };

    return TAG_Int_Array;

  })(TAG);

  TAG_Compound = (function(_super) {
    __extends(TAG_Compound, _super);

    function TAG_Compound() {
      this.read = __bind(this.read, this);      _ref12 = TAG_Compound.__super__.constructor.apply(this, arguments);
      return _ref12;
    }

    TAG_Compound.prototype.read = function() {
      var bob, e, i, key, obj, tag, val;

      obj = {};
      i = 0;
      tag = 'dummy';
      while ((tag != null) && tag !== '=END=' && i < 160) {
        try {
          tag = this.reader.read();
          if ((tag != null) && tag !== '=END=') {
            for (key in tag) {
              val = tag[key];
              if (key === 'Y') {
                bob = 'test';
              }
              obj[key] = val;
            }
          }
        } catch (_error) {
          e = _error;
          console.log('Error in TAG_Compound');
          console.log(e);
        }
        i++;
      }
      return obj;
    };

    return TAG_Compound;

  })(TAG);

  global.NBTReader = (function() {
    function NBTReader(nbtbytes) {
      var i, _i, _ref13;

      this.nbtbytes = nbtbytes;
      this.getString = __bind(this.getString, this);
      this.getInt32 = __bind(this.getInt32, this);
      this.getInt16 = __bind(this.getInt16, this);
      this.getFloat64 = __bind(this.getFloat64, this);
      this.getInt64 = __bind(this.getInt64, this);
      this.getFloat32 = __bind(this.getFloat32, this);
      this.getInt8 = __bind(this.getInt8, this);
      this.getUint8 = __bind(this.getUint8, this);
      this.nbtBuffer = new ArrayBuffer(nbtbytes.length);
      this.byteView = new Uint8Array(this.nbtBuffer);
      for (i = _i = 0, _ref13 = nbtbytes.length - 1; 0 <= _ref13 ? _i <= _ref13 : _i >= _ref13; i = 0 <= _ref13 ? ++_i : --_i) {
        this.byteView[i] = nbtbytes[i];
      }
      this.dataview = new dataview(this.nbtBuffer);
      this.dataview.seek.call(this.dataview, 0);
    }

    NBTReader.prototype.getUint8 = function() {
      return this.dataview.getUint8.call(this.dataview);
    };

    NBTReader.prototype.getInt8 = function() {
      return this.dataview.getInt8.call(this.dataview);
    };

    NBTReader.prototype.getFloat32 = function() {
      return this.dataview.getFloat32.call(this.dataview);
    };

    NBTReader.prototype.getFloat64 = function() {
      return this.dataview.getFloat64.call(this.dataview);
    };

    NBTReader.prototype.getInt64 = function() {
      return this.dataview.getInt64.call(this.dataview);
    };


    NBTReader.prototype.getInt16 = function() {
      return this.dataview.getInt16.call(this.dataview);
    };

    NBTReader.prototype.getInt32 = function() {
      return this.dataview.getInt32.call(this.dataview);
    };

    NBTReader.prototype.getString = function(length) {
      return this.dataview.getString.call(this.dataview, length, undefined, 'utf8');
    };

    NBTReader.prototype.read = function(typespec) {
      var e, name, name2, ret, tag, type, typeStr;

      try {
        type = null;
        if (typespec == null) {
          type = this.getUint8();
          if (type == null) {
            console.log('problem with type in nbt. type is:');
            console.log(type);
          }
        } else {
          type = typespec;
        }
        typeStr = '_' + type.toString();
        name = tags[typeStr];
        switch (name) {
          case 'TAG_End':
            tag = new TAG_End(this);
            break;
          case 'TAG_Byte':
            tag = new TAG_Byte(this);
            break;
          case 'TAG_Short':
            tag = new TAG_Short(this);
            break;
          case 'TAG_Int':
            tag = new TAG_Int(this);
            break;
          case 'TAG_Long':
            tag = new TAG_Long(this);
            break;
          case 'TAG_Float':
            tag = new TAG_Float(this);
            break;
          case 'TAG_Double':
            tag = new TAG_Double(this);
            break;
          case 'TAG_Byte_Array':
            tag = new TAG_Byte_Array(this);
            break;
          case 'TAG_Int_Array':
            tag = new TAG_Int_Array(this);
            break;
          case 'TAG_String':
            tag = new TAG_String(this);
            break;
          case 'TAG_List':
            tag = new TAG_List(this);
            break;
          case 'TAG_Compound':
            tag = new TAG_Compound(this);
            break;
          default:
            tag = new TAG_Unknown(this);
        }
        if (name === 'TAG_End') {
          return '=END=';
        }
        ret = {};
        name2 = '';
        if (typespec == null) {
          if (name !== 'TAG_End') {
            name2 = tag.readName();
            if (name === 'TAG_Compound' && name2 === '') {
              name2 = 'root';
            }
          } else {
            name2 = 'END';
          }
          ret[name2] = tag.read();
        } else {
          ret = tag.read();
        }
        return ret;
      } catch (_error) {
        e = _error;
        console.log('Error in nbt: ' + e.message);
        console.log(e.stack);
        return null;
      }
    };

    return NBTReader;

  })();

})(module.exports);

},{"jdataview":1}]},{},[]);
