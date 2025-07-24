import React, { useState } from 'react';
import styles from './ComponentDemo.module.scss';

interface PropControl {
  name: string;
  type: 'text' | 'boolean' | 'number';
  defaultValue: any;
  description?: string;
}

interface ComponentDemoProps {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  propControls: PropControl[];
  defaultProps: Record<string, any>;
}

const ComponentDemo: React.FC<ComponentDemoProps> = ({
  name,
  description,
  component: Component,
  propControls,
  defaultProps,
}) => {
  const [props, setProps] = useState(defaultProps);

  const updateProp = (propName: string, value: any) => {
    setProps(prev => ({ ...prev, [propName]: value }));
  };

  const renderControl = (control: PropControl) => {
    const value = props[control.name];

    switch (control.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateProp(control.name, e.target.value)}
            className={styles.textInput}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => updateProp(control.name, e.target.checked)}
            className={styles.checkbox}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => updateProp(control.name, Number(e.target.value))}
            className={styles.numberInput}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.componentDemo}>
      <div className={styles.header}>
        <h3 className={styles.componentName}>{name}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.demoContent}>
        <div className={styles.preview}>
          <h4>Preview</h4>
          <div className={styles.previewContainer}>
            <Component {...props} />
          </div>
        </div>

        <div className={styles.controls}>
          <h4>Props</h4>
          <div className={styles.controlsContainer}>
            {propControls.map((control) => (
              <div key={control.name} className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  {control.name}
                  {control.description && (
                    <span className={styles.controlDescription}>
                      {control.description}
                    </span>
                  )}
                </label>
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.codeExample}>
        <h4>Usage</h4>
        <pre className={styles.code}>
          {`<${name} ${Object.entries(props)
            .map(([key, value]) => {
              if (typeof value === 'string') return `${key}="${value}"`;
              if (typeof value === 'boolean') return value ? key : `${key}={false}`;
              return `${key}={${JSON.stringify(value)}}`;
            })
            .join(' ')} />`}
        </pre>
      </div>
    </div>
  );
};

export default ComponentDemo;