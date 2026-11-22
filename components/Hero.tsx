// Night seen through a rainy window: soft out-of-focus lamps and a few streaks of rain,
// drawn in CSS so it loads instantly and carries no image weight. Decorative only.
export function RainyWindow() {
  return (
    <>
      <span className="bokeh bokeh-1" />
      <span className="bokeh bokeh-2" />
      <span className="bokeh bokeh-3" />
      <span className="bokeh bokeh-4" />
      <span className="drip drip-1" />
      <span className="drip drip-2" />
      <span className="drip drip-3" />
      <span className="window-warmth" />
    </>
  );
}

export function BookCoverArt() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/book-cover.jpg"
      width={512}
      height={800}
      alt="Book cover: Not Alone at Midnight. Rain on a window at night, with street lamps glowing in the distance."
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
