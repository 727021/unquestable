import { Link } from "@remix-run/react"

const Footer = () => {
  return (
    <footer className="footer footer-center p-10 bg-base-300 text-base-content">
      <nav className="grid grid-flow-col gap-4">
        <Link to="#" className="link link-hover">About Us</Link>
        <Link to="#" className="link link-hover">Terms of Use</Link>
        <Link to="#" className="link link-hover">Privacy Policy</Link>
      </nav>
      <div className="text-left">
        {/* Disclaimer copied from https://cards.boardwars.eu/ */}
        This website is not produced, endorsed, supported, or affiliated with
        Fantasy Flight Games. The copyrightable portions of Star Wars: Imperial
        Assault and its expansions are © 2014 - 2016 Fantasy Flight Publishing,
        Inc. Star Wars, and the characters, items, events and places therein are
        trademarks or registered trademarks of Lucas Film Limited and are used,
        under license, by Fantasy Flight Games. The Fantasy Flight Supply and the
        Fantasy Flight logo are trademarks and/or registered trademarks of Fantasy
        Flight Publishing, Inc. All Rights Reserved to their respective owners.
      </div>
    </footer>
  )
}

export default Footer
