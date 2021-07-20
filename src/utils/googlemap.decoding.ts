export class GoogleMapDecoding {
    // decode fxn
    public static bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    public static decode(encoded, options) {
        options = this.defaultOptions(options);
        var flatPoints = this.decodeDeltas(encoded, options);
        var points = [];
        for (var i = 0, len = flatPoints.length; i + (options.dimension - 1) < len;) {
            try {
                var point = {
                    lat: flatPoints[i],
                    lng: flatPoints[i + 1]
                }
                i = i + 2;
                this.bounds.extend(point);
                points.push(point);
            } catch (err) {
                console.log(err);
            }
        }
        return points;
    }

    public static decodeDeltas(encoded, options) {
        options = this.defaultOptions(options);

        var lastNumbers = [];

        var numbers = this.decodeFloats(encoded, options);
        for (var i = 0, len = numbers.length; i < len;) {
            for (var d = 0; d < options.dimension; ++d, ++i) {
                numbers[i] = lastNumbers[d] = numbers[i] + (lastNumbers[d] || 0);
            }
        }
        return numbers;
    }


    public static decodeFloats(encoded, options) {
        options = this.defaultOptions(options);
        var numbers = this.decodeSignedIntegers(encoded);
        for (var i = 0, len = numbers.length; i < len; ++i) {
            numbers[i] /= options.factor;
        }
        return numbers;
    }

    public static defaultOptions(options) {
        if (typeof options === 'number') {
            options = { precision: options };
        } else {
            options = options || {};
        }
        options.precision = options.precision || 5;
        options.factor = options.factor || Math.pow(10, options.precision);
        options.dimension = options.dimension || 2;
        return options;
    }

    public static decodeSignedIntegers(encoded) {
        var numbers = this.decodeUnsignedIntegers(encoded);
        for (var i = 0, len = numbers.length; i < len; ++i) {
            var num = numbers[i];
            numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1);
        }
        return numbers;
    }

    public static decodeUnsignedIntegers(encoded) {
        var numbers = [];
        var current = 0;
        var shift = 0;
        for (var i = 0, len = encoded.length; i < len; ++i) {
            var b = encoded.charCodeAt(i) - 63;
            current |= (b & 0x1f) << shift;
            if (b < 0x20) {
                numbers.push(current);
                current = 0;
                shift = 0;
            } else {
                shift += 5;
            }
        }
        return numbers;
    }


}