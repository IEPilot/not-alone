import Link from "next/link";
import { nav, site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2>The light is on</h2>
            <p className="footer-note">
              If tonight is heavy, you are welcome here at any hour. If you are in crisis or thinking about ending your
              life, call or text <strong>988</strong> (United States) or visit our{" "}
              <Link href="/resources" style={{ fontFamily: "var(--font-body)", color: "var(--amber)" }}>
                resources page
              </Link>
              .
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Keep in touch</h2>
            <ul>
              <li>
                <Link href="/#newsletter">Newsletter</Link>
              </li>
              <li>
                <Link href="/feed.xml">RSS feed</Link>
              </li>
              <li>
                <Link href="/book">The book</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Not a substitute for professional care.</span>
        </div>
      </div>
    </footer>
  );
}
