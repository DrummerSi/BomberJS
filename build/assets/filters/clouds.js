
Phaser.Filter.Clouds = function (game) {

    Phaser.Filter.call(this, game);

    this.uniforms.alpha = { type: '1f', value: 1.0 };
    this.uniforms.shift = { type: '1f', value: 1.6 };
    this.uniforms.speed = { type: '2f', value: { x: 0.7, y: 0.4 } };

    this.fragmentSrc = [

        "precision mediump float;",
        "uniform vec2      resolution;",
        "uniform float     time;",


        "#define TAU 6.28318530718",

        "const vec3 BackColor	= vec3(0.0, 0.4, 0.58);",
        "const vec3 CloudColor	= vec3(0.18,0.70,0.87);",

        "float Func(float pX){",
	        "return 0.6*(0.5*sin(0.1*pX) + 0.5*sin(0.553*pX) + 0.7*sin(1.2*pX));",
        "}",

        "float FuncR(float pX){",
	        "return 0.5 + 0.25*(1.0 + sin(mod(40.0*pX, TAU)));",
        "}",

        "float Layer(vec2 pQ, float pT){",
	        "vec2 Qt = 3.5*pQ;",
            "pT *= 0.5;",
            "Qt.x += pT;",

            "float Xi = floor(Qt.x);",
            "float Xf = Qt.x - Xi -0.5;",

            "vec2 C;",
            "float Yi;",
            "float D = 1.0 - step(Qt.y,  Func(Qt.x));",

            "// Disk:",
            "Yi = Func(Xi + 0.5);",
            "C = vec2(Xf, Qt.y - Yi ); ",
            "D =  min(D, length(C) - FuncR(Xi+ pT/80.0));",

            "// Previous disk:",
            "Yi = Func(Xi+1.0 + 0.5);",
            "C = vec2(Xf-1.0, Qt.y - Yi ); ",
            "D =  min(D, length(C) - FuncR(Xi+1.0+ pT/80.0));",

            "// Next Disk:",
            "Yi = Func(Xi-1.0 + 0.5);",
            "C = vec2(Xf+1.0, Qt.y - Yi ); ",
            "D =  min(D, length(C) - FuncR(Xi-1.0+ pT/80.0));",

            "return min(1.0, D);",
        "}",

        "void main(void){",
	        "vec2 uv = 1.2*(2.0*gl_FragCoord.xy - resolution.xy) / resolution.y;",
	
            "// Render:",
            "vec3 Color= BackColor;",

            "for(float J=0.0; J<=1.0; J+=0.2)",
            "{",
                "// Cloud Layer: ",
                "float Lt =  time*(0.5  + 2.0*J)*(1.0 + 0.1*sin(226.0*J)) + 17.0*J;",
                "vec2 Lp = vec2(0.0, 0.3+1.5*( J - 0.5));",
                "float L = Layer(uv + Lp, Lt);",

                "// Blur and color:",
                "float Blur = 4.0*(0.5*abs(2.0 - 5.0*J))/(11.0 - 5.0*J);",

                "float V = mix( 0.0, 1.0, 1.0 - smoothstep( 0.0, 0.01 +0.2*Blur, L ) );",
                "vec3 Lc=  mix( CloudColor, vec3(1.0), J);",

                "Color =mix(Color, Lc,  V);",
            "}",
            "gl_FragColor = vec4(Color,1.);",
        "}"
    ];

};

Phaser.Filter.Clouds.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Clouds.prototype.constructor = Phaser.Filter.Clouds;

Phaser.Filter.Clouds.prototype.init = function (width, height, alpha, shift) {

    this.setResolution(width, height);

    if (typeof alpha !== 'undefined') {
        this.uniforms.alpha.value = alpha;
    }

    if (typeof shift !== 'undefined') {
        this.uniforms.shift.value = shift;
    }

};

Object.defineProperty(Phaser.Filter.Clouds.prototype, 'alpha', {

    get: function () {
        return this.uniforms.alpha.value;
    },

    set: function (value) {
        this.uniforms.alpha.value = value;
    }

});

Object.defineProperty(Phaser.Filter.Clouds.prototype, 'shift', {

    get: function () {
        return this.uniforms.shift.value;
    },

    set: function (value) {
        this.uniforms.shift.value = value;
    }

});

Object.defineProperty(Phaser.Filter.Clouds.prototype, 'speed', {

    get: function () {
        return this.uniforms.speed.value;
    },

    set: function (value) {
        this.uniforms.speed.value = value;
    }

});