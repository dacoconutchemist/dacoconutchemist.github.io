
# My code golfs

For those who don't know, code golf is trying to fit code into the least amount of characters. Usually in a code golf challenge the code has to do some defined minimal functionality, but here I add features as I go and try to put them into the least amount of characters (so versions of the same program most likely also differ in functionality and might be longer because of that).

I try specifically to minimise characters, not bytes.

I'm too lazy to write a web page for this now, so this README will do.

# Project code explanations

## Donut
Let's look at the code not in one row:
```javascript
setInterval(u=>{
    K=e=>Array(24).fill(e);
    M=K`  `.map(K);
    Q=[];
    with(Math)
        s=sin,
        c=cos,
        F=floor;
    P=(x,y,z)=>(
        w=y*(B=c(W))-z*(A=s(W)),
        [x*(D=c(V))-w*(C=s(V)),x*C+w*D,y*A+z*B]
    );
    for(i=500;i>0;i-=.05)
        p=c(h=i%7),
        m=s(g=i/79),
        n=c(g),
        Q.push([
            P(n*p,m*p,o=s(h))[1],
            ...P((a=9+3*p)*n,a*m,3*o)
        ]);
    Q.sort((e,f)=>f[3]-e[3]);
    Q.map(e=>{
        T="█▓▒░ "[F(e[0]*2+2)];
        M[F(e[2]+12)][F(e[1]+12)]=T+T
    });
    W+=1/8;
    V+=.1;
    console.log(M.map(e=>e.join``).join`
`)
},W=V=110)
```

Now let's look at the code piece by piece.

```javascript
setInterval(u=>{
    // ...
},W=V=110)
```

As we can see from `setInterval`, the code gets run every 110ms, printing the next frame of the donut. This also defines the variables `W` and `V`, which are the pitch and yaw of the donut in radians. They are set to 110 because it's both a reasonable delay for drawing frames and a number quite close to a multiple of π (110 ≈ 35π), which will position the donut to face the viewer.

```javascript
K=e=>Array(24).fill(e);
M=K`  `.map(K);
```
This defines the utility function `K` that returns an array of length 24 filled up with its argument. `M` fills up an array with `` `  ` `` (two spaces) and then `map`s `K` to each of them, creating a 24x24 grid of spaces which is the character "pixel" array to which stuff will be written later

```javascript
Q=[];
with(Math)
    s=sin,
    c=cos,
    F=floor;
```
Here the array `Q` is defined, which will contain the positions of points on the donut in 3D, later acting as a depth buffer. This also creates shorthands for `Math.sin`, `Math.cos` and `Math.floor`, using `with` to avoid writing `Math.` 3 times.

```javascript
P=(x,y,z)=>(
    w=y*(B=c(W))-z*(A=s(W)),
    [x*(D=c(V))-w*(C=s(V)),x*C+w*D,y*A+z*B]
);
```
This performs the rotation of the point (x,y,z) by the pitch and roll in variables `W` and `V` (or, more precisely, the rotation of the point around the Z axis by `V` radians and then the rotation of the point around the Y axis by `W` radians). To shorten the code, the sine and cosine of `W` and `V` are being set to variables to be used later in the function.

```javascript
for(i=500;i>0;i-=.05)
    p=c(h=i%7),
    m=s(g=i/79),
    n=c(g),
    Q.push([
        P(n*p,m*p,o=s(h))[1],
        ...P((a=9+3*p)*n,a*m,3*o)
    ]);
```
This part of the code calculates the positions of points on the donut. Actually, the donut that is displayed basicallly consists of a spiral going along the donut, the points of which are packed closely enough to create the illusion of a full donut. The donut has the major and minor radii of 9 and 3 respectively.

`h` here is the angle orrecponding to the minor radius and `g` is the angle corresponding to the minor radius. Also,  $`\mathbf{n} \cdot \hat y`$ (dot product of the normal and the unit y vector, which is basically just the y-component of the vector) is stored as the first element to calculate the lighting (or rather the coloring) later.

```javascript
Q.sort((e,f)=>f[3]-e[3]);
```

Here we sort the points in the array by their z coordinate for a kind of rudimentary z-buffer.

```javascript
Q.map(e=>{
    T="█▓▒░ "[F(e[0]*2+2)];
    M[F(e[2]+12)][F(e[1]+12)]=T+T
});
```

Here, we look through every point in the donut and color them depending on their first element (normal). Then we write the calculated color twice to the respective cell (twice to get the approximately square aspect ratio), offsetting the coordinates by 12 to center them.

```javascript
W+=1/8;
V+=.1;
```

Change the pitch and yaw for the next frame

```javascript
console.log(M.map(e=>e.join``).join`
`)
```
Joining the characters together and printing them to the console. Here a newline character is used instead of `\n` to shorten the length.


Now, let's look at the compressed version of the code:

```javascript
_="";
for(G of`unicode gibberish`)
    for(v=G.charCodeAt();v|0;v/=95)
        _+=String.fromCharCode(v%95+31);
eval(_)
```
Here, each character of the compressed string is interpreted as a base-95 number, the digits of which are ASCII characters in the 31 - 126 range (usual word characters). The newlines and `"█▓▒░ "` are escaped (in the case of the color pallette escaped with `\u`) to achieve the restricted character range. This basically compressed every 2 characters of the original code into one of the unicode gibberish (minus the overhead code to decompress it). As a result, we get the original code and `eval` it.

## Minesweeper
wip

## Snake
wip
