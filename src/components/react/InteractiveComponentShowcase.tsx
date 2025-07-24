import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

const InteractiveComponentShowcase: React.FC = () => {
  // Button demo state
  const [buttonLabel, setButtonLabel] = useState('Click me!');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // PageLink demo state  
  const [linkText, setLinkText] = useState('Sample Link');
  const [linkTo, setLinkTo] = useState('/example');
  const [linkHidden, setLinkHidden] = useState(false);

  // Button animation
  const [buttonSprings, buttonApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 200, friction: 5 },
  }));

  const handleButtonClick = () => {
    console.log('Demo button clicked:', buttonLabel);
  };

  const handleButtonMouseEnter = () => !buttonDisabled && buttonApi.start({ scale: 1.05 });
  const handleButtonMouseLeave = () => buttonApi.start({ scale: 1 });

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Demo link clicked:', linkTo);
  };

  const containerStyle: React.CSSProperties = {
    marginBottom: '3rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'white',
  };

  const headerStyle: React.CSSProperties = {
    padding: '1.5rem',
    background: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  };

  const demoContentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    minHeight: '200px',
  };

  const previewStyle: React.CSSProperties = {
    padding: '1.5rem',
    borderRight: '1px solid #e0e0e0',
  };

  const previewContainerStyle: React.CSSProperties = {
    padding: '1rem',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    background: '#fafafa',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const controlsStyle: React.CSSProperties = {
    padding: '1.5rem',
    background: '#f8f9fa',
  };

  const buttonStyle: React.CSSProperties = {
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: buttonDisabled ? 'not-allowed' : 'pointer',
    opacity: buttonDisabled ? 0.6 : 1,
    background: '#007acc',
  };

  const linkStyle: React.CSSProperties = {
    color: '#007acc',
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    width: '100%',
    marginTop: '0.25rem',
  };

  return (
    <div>
      {/* Button Demo */}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#333' }}>
            Button
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            An animated button component with hover effects and customizable text.
          </p>
        </div>

        <div style={demoContentStyle}>
          <div style={previewStyle}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Preview</h4>
            <div style={previewContainerStyle}>
              <animated.button
                onClick={handleButtonClick}
                disabled={buttonDisabled}
                style={{
                  ...buttonSprings,
                  ...buttonStyle,
                }}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                {buttonLabel}
              </animated.button>
            </div>
          </div>

          <div style={controlsStyle}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Props</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#555' }}>
                  label
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', color: '#888', marginTop: '0.25rem' }}>
                    The text displayed on the button
                  </span>
                </label>
                <input
                  type="text"
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={buttonDisabled}
                    onChange={(e) => setButtonDisabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  disabled
                  <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#888' }}>
                    Whether the button is disabled
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#f1f3f4', borderTop: '1px solid #e0e0e0' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Usage</h4>
          <pre style={{
            background: '#2d3748',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            overflowX: 'auto',
            margin: 0,
            fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
          }}>
            {`<Button label="${buttonLabel}" disabled={${buttonDisabled}} />`}
          </pre>
        </div>
      </div>

      {/* PageLink Demo */}
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#333' }}>
            PageLink
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            A styled link component for navigation between pages.
          </p>
        </div>

        <div style={demoContentStyle}>
          <div style={previewStyle}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Preview</h4>
            <div style={previewContainerStyle}>
              {!linkHidden && (
                <a
                  href={linkTo}
                  onClick={handleLinkClick}
                  style={linkStyle}
                >
                  {linkText}
                </a>
              )}
              {linkHidden && (
                <span style={{ color: '#999', fontStyle: 'italic' }}>
                  (Link is hidden)
                </span>
              )}
            </div>
          </div>

          <div style={controlsStyle}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Props</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#555' }}>
                  text
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', color: '#888', marginTop: '0.25rem' }}>
                    The link text to display
                  </span>
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#555' }}>
                  to
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', color: '#888', marginTop: '0.25rem' }}>
                    The URL to link to
                  </span>
                </label>
                <input
                  type="text"
                  value={linkTo}
                  onChange={(e) => setLinkTo(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={linkHidden}
                    onChange={(e) => setLinkHidden(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  isHidden
                  <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#888' }}>
                    Whether to hide the link
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#f1f3f4', borderTop: '1px solid #e0e0e0' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Usage</h4>
          <pre style={{
            background: '#2d3748',
            color: '#e2e8f0',
            padding: '1rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            overflowX: 'auto',
            margin: 0,
            fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
          }}>
            {`<PageLink text="${linkText}" to="${linkTo}" isHidden={${linkHidden}} />`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InteractiveComponentShowcase;