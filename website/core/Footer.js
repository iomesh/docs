/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    return `${baseUrl}${docsPart}${doc}`;
  }

  render() {
    return (
      <footer id="footer" className="nav-footer">
        <div className="footerWrapper">
          <div className="">IOMesh</div>
          <div className="linkList">
            <a className="footerLink" href="https://iomesh.com/spec">Spec</a>
            <a
              className="footerLink"
              href="http://docs.iomesh.com/next/introduction/introduction"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
            {/* <a className="footerLink" href="">Blog</a> */}
            <a className="footerLink" href="https://iomesh.com/contact">Contact Us</a>
            <a className="footerLink" href="https://iomesh.com/privacy">Privacy Policy</a>
            <span className=""> | </span>
            <a
              className="footerLink"
              href="https://join.slack.com/t/slack-vcm1551/shared_invite/zt-nx33ud5h-~0D_MD5kL0sUrwslB~KF_A"
              target="_blank"
              rel="noreferrer"
            >
              Slack
            </a>
            <a
              className="footerLink"
              href="https://twitter.com/iomeshhq"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
            <a
              className="footerLink"
              href="https://www.youtube.com/channel/UCJV59ZDxjm822LK_oUhi7qA"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
          </div>
        </div>
      </footer>
    );
  }
}

module.exports = Footer;
