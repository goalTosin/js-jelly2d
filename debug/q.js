async function asyncLoop(start, end, incr, callback, slice = 10000) {
  let i = start;
  for (; i < Math.min(start + slice, end); i+=incr) {
    callback(i);
  }
  await new Promise((res) => setTimeout(res, 1));
  if (i < end) {
    return await asyncLoop(i, end, incr, callback, slice);
  }
}
asyncLoop(
  0,
  1000,1,
  (i) => {
    console.log(`Hey ${i}`);
  },
  100
);
