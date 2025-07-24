import { useState } from 'react';
import Button from '../Button/Button.tsx';
import PageLink from '../PageLink/PageLink.tsx';
import styles from './ComponentShowcase.module.scss';

interface ComponentConfig {
  name: string;
  component: any;
  props: Record<string, any>;
  propTypes: Record<string, {
    type: 'string' | 'boolean' | 'function';
    defaultValue: any;
    options?: string[];
  }>;
}

const componentConfigs: ComponentConfig[] = [
  {
    name: 'Button',
    component: Button,
    props: {
      id: 'demo-button',
      onClick: () => alert('Button clicked!'),
      label: 'Click me!'
    },
    propTypes: {
      id: { type: 'string', defaultValue: 'demo-button' },
      label: { type: 'string', defaultValue: 'Click me!' },
      onClick: { type: 'function', defaultValue: () => alert('Button clicked!') }
    }
  },
  {
    name: 'PageLink',
    component: PageLink,
    props: {
      to: '/worms-3',
      text: 'Go to Worms 3',
      isHidden: false
    },
    propTypes: {
      to: { type: 'string', defaultValue: '/worms-3' },
      text: { type: 'string', defaultValue: 'Go to Worms 3' },
      isHidden: { type: 'boolean', defaultValue: false }
    }
  }
];

const ComponentShowcase = () => {
  const [componentStates, setComponentStates] = useState(
    componentConfigs.map(config => ({ ...config.props }))
  );

  const updateProp = (componentIndex: number, propName: string, value: any) => {
    setComponentStates(prev => {
      const newStates = [...prev];
      newStates[componentIndex] = {
        ...newStates[componentIndex],
        [propName]: value
      };
      return newStates;
    });
  };

  const generateCode = (config: ComponentConfig, props: Record<string, any>) => {
    const propsString = Object.entries(props)
      .filter(([key]) => key !== 'onClick') // Skip function props in code
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(' ');

    return `<${config.name} ${propsString} />`;
  };

  return (
    <div className={styles.showcase}>
      <h1>Interactive Component Showcase</h1>
      <p className={styles.description}>
        Explore components interactively. Change props and see live updates!
      </p>

      {componentConfigs.map((config, componentIndex) => {
        const Component = config.component;
        const currentProps = componentStates[componentIndex];

        return (
          <div key={config.name} className={styles.componentSection}>
            <h2 className={styles.componentTitle}>{config.name}</h2>
            
            <div className={styles.componentDemo}>
              <div className={styles.preview}>
                <h3>Preview</h3>
                <div className={styles.previewContainer}>
                  <Component {...currentProps} />
                </div>
              </div>

              <div className={styles.controls}>
                <h3>Props</h3>
                <div className={styles.controlsContainer}>
                  {Object.entries(config.propTypes).map(([propName, propConfig]) => (
                    <div key={propName} className={styles.control}>
                      <label className={styles.controlLabel}>{propName}</label>
                      {propConfig.type === 'string' && (
                        <input
                          type="text"
                          value={currentProps[propName]}
                          onChange={(e) => updateProp(componentIndex, propName, e.target.value)}
                          className={styles.controlInput}
                        />
                      )}
                      {propConfig.type === 'boolean' && (
                        <input
                          type="checkbox"
                          checked={currentProps[propName]}
                          onChange={(e) => updateProp(componentIndex, propName, e.target.checked)}
                          className={styles.controlCheckbox}
                        />
                      )}
                      {propConfig.type === 'function' && (
                        <span className={styles.functionIndicator}>Function</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.code}>
                <h3>Usage</h3>
                <pre className={styles.codeBlock}>
                  <code>{generateCode(config, currentProps)}</code>
                </pre>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComponentShowcase;