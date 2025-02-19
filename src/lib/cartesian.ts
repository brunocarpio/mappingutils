// Function to compute the cartesian product of input arrays, adapted from Stack Overflow
// Source: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
// Author: rsp
export function cartesian(...pairs: any[][]): any[][] {
    return pairs.reduce((a, b) =>
        a.flatMap((ae) => b.map((be) => [ae, be].flat())),
    );
}
