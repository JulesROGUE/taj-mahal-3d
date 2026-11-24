// Material 3 React components (Material You style). Import what you need:
// import { Button, Card, TextField, NavigationRail, ... } from './m3';
import { useEffect, useId } from 'react';

const cx = (...c) => c.filter(Boolean).join(' ');

function ripple(e) {
  const el = e.currentTarget;
  if (!el || el.disabled) return;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2;
  const s = document.createElement('span');
  s.className = 'm3-ripple';
  Object.assign(s.style, { width: `${size}px`, height: `${size}px`, left: `${e.clientX - r.left - size / 2}px`, top: `${e.clientY - r.top - size / 2}px` });
  el.appendChild(s);
  setTimeout(() => s.remove(), 500);
}

function Pressable({ className, onPointerDown, type = 'button', ...rest }) {
  return <button type={type} className={cx('m3-sl', className)} onPointerDown={(e) => { ripple(e); onPointerDown?.(e); }} {...rest} />;
}

/** Material Symbols icon by name, e.g. <Icon name="home" filled />. */
export function Icon({ name, filled, size, label, className, style }) {
  return (
    <span className={cx('m3-icon', filled && 'is-filled', className)} style={{ ...(size ? { fontSize: size } : {}), ...style }}
      aria-hidden={label ? undefined : 'true'} aria-label={label} role={label ? 'img' : undefined}>
      {name}
    </span>
  );
}
const ic = (i, filled) => (typeof i === 'string' ? <Icon name={i} filled={filled} /> : i);

/** variant: filled | tonal | elevated | outlined | text | danger */
export function Button({ variant = 'filled', icon, trailingIcon, className, children, ...rest }) {
  return (
    <Pressable className={cx('m3-btn', `m3-btn--${variant}`, icon && 'has-icon', className)} {...rest}>
      {icon && ic(icon)}{children}{trailingIcon && ic(trailingIcon)}
    </Pressable>
  );
}

/** variant: standard | filled | tonal | outlined. Always give a label (tooltip + accessible name). */
export function IconButton({ icon, label, variant = 'standard', selected, className, ...rest }) {
  return (
    <Pressable className={cx('m3-icon-btn', variant !== 'standard' && `m3-icon-btn--${variant}`, selected && 'is-selected', className)}
      aria-label={label} title={label} aria-pressed={selected === undefined ? undefined : !!selected} {...rest}>
      {ic(icon, selected)}
    </Pressable>
  );
}

/** size: small | regular | large; color: primary | secondary | tertiary. label = accessible name;
 *  extended shows it next to the icon (not inside a NavigationRail, which is 80 px wide). */
export function FAB({ icon, label, extended, size = 'regular', color = 'primary', className, ...rest }) {
  return (
    <Pressable className={cx('m3-fab', size !== 'regular' && `m3-fab--${size}`, color !== 'primary' && `m3-fab--${color}`, className)}
      aria-label={label} title={extended ? undefined : label} {...rest}>
      {ic(icon)}{extended && label && <span>{label}</span>}
    </Pressable>
  );
}

/** options: [{ value, label, icon? }] */
export function SegmentedButton({ options, value, onChange, className }) {
  return (
    <div className={cx('m3-segmented', className)} role="group">
      {options.map((o) => (
        <Pressable key={o.value} className={cx(value === o.value && 'is-selected')} aria-pressed={value === o.value} onClick={() => onChange?.(o.value)}>
          {value === o.value ? <Icon name="check" /> : o.icon && ic(o.icon)}{o.label}
        </Pressable>
      ))}
    </div>
  );
}

export function Chip({ icon, selected, className, children, ...rest }) {
  return (
    <Pressable className={cx('m3-chip', (icon || selected) && 'has-icon', selected && 'is-selected', className)} aria-pressed={selected} {...rest}>
      {selected ? <Icon name="check" /> : icon && ic(icon)}{children}
    </Pressable>
  );
}
export const ChipSet = ({ children, className }) => <div className={cx('m3-chip-set', className)}>{children}</div>;

/** variant: elevated | filled | outlined */
export function Card({ variant = 'filled', onClick, className, children, style }) {
  return (
    <div className={cx('m3-card', `m3-card--${variant}`, onClick && 'm3-sl is-clickable', className)} style={style}
      onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}>
      {children}
    </div>
  );
}

/** variant: outlined | filled. multiline -> textarea; options -> select. */
export function TextField({ label, value, onChange, variant = 'outlined', leadingIcon, trailing, supportingText, error, multiline, options, className, inputProps, ...rest }) {
  const id = useId();
  const common = { id, className: 'm3-field__input', value, onChange: (e) => onChange?.(e.target.value, e), 'aria-invalid': !!error, ...inputProps, ...rest };
  return (
    <div className={cx('m3-field', `m3-field--${variant}`, error && 'is-error', className)}>
      <div className={cx('m3-field__box', !label && 'no-label', leadingIcon && 'has-leading')}>
        {leadingIcon && ic(leadingIcon)}
        {label && <label className="m3-field__label" htmlFor={id}>{label}</label>}
        {options ? (
          <select {...common}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
        ) : multiline ? <textarea {...common} /> : <input {...common} />}
        {trailing}
      </div>
      {(error || supportingText) && <div className="m3-field__support">{error || supportingText}</div>}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Rechercher', trailing, className, style }) {
  return (
    <label className={cx('m3-search', className)} style={style}>
      <Icon name="search" />
      <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {trailing}
    </label>
  );
}

export function Switch({ checked, onChange, label, className }) {
  return (
    <label className={cx('m3-switch', className)}>
      <input type="checkbox" role="switch" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="m3-switch__track" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, label, className }) {
  return (
    <label className={cx('m3-check', className)}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange?.(e.target.checked)} />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Radio({ checked, onChange, label, name, className }) {
  return (
    <label className={cx('m3-check', className)}>
      <input type="radio" name={name} checked={!!checked} onChange={() => onChange?.()} />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, className }) {
  return <input type="range" className={cx('m3-slider', className)} value={value} min={min} max={max} step={step} aria-label={label} onChange={(e) => onChange?.(Number(e.target.value))} />;
}

export const List = ({ children, className }) => <ul className={cx('m3-list', className)}>{children}</ul>;

export function ListItem({ headline, supporting, leading, trailing, selected, onClick, className }) {
  const inner = (
    <>
      {leading && <span className="m3-list-item__leading">{ic(leading)}</span>}
      <span className="m3-list-item__text">
        <span className="m3-list-item__headline">{headline}</span>
        {supporting && <span className="m3-list-item__supporting">{supporting}</span>}
      </span>
      {trailing && <span className="m3-list-item__trailing">{ic(trailing)}</span>}
    </>
  );
  return (
    <li>
      {onClick ? <Pressable className={cx('m3-list-item', selected && 'is-selected', className)} onClick={onClick}>{inner}</Pressable>
        : <div className={cx('m3-list-item', selected && 'is-selected', className)}>{inner}</div>}
    </li>
  );
}

export const Avatar = ({ children, style }) => <span className="m3-avatar" style={style}>{children}</span>;
export const Divider = ({ className }) => <hr className={cx('m3-divider', className)} />;

/** items: [{ value, label, icon, badge? }] — desktop navigation on the left. */
export function NavigationRail({ items, value, onChange, fab, footer }) {
  return (
    <nav className="m3-rail" aria-label="Navigation">
      {fab && <div className="m3-rail__fab">{fab}</div>}
      {items.map((it) => (
        <button key={it.value} type="button" className={cx('m3-rail__item', value === it.value && 'is-active')}
          aria-current={value === it.value ? 'page' : undefined} onClick={() => onChange?.(it.value)}>
          <span className="m3-rail__indicator m3-sl">
            <Icon name={it.icon} filled={value === it.value} />
            {it.badge ? <span className="m3-badge" style={{ position: 'absolute', top: 2, right: 10 }}>{it.badge}</span> : null}
          </span>
          {it.label}
        </button>
      ))}
      <div className="m3-rail__spacer" />
      {footer}
    </nav>
  );
}

export function TopAppBar({ title, leading, actions }) {
  return (
    <header className="m3-top-bar">
      {leading}
      <h1 className="m3-top-bar__title">{title}</h1>
      {actions && <div className="m3-top-bar__actions">{actions}</div>}
    </header>
  );
}

/** tabs: [{ value, label }] */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="m3-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value} className={cx('m3-tab m3-sl', value === t.value && 'is-active')} onClick={() => onChange?.(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Dialog({ open, headline, icon, children, actions, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="m3-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="m3-dialog" role="dialog" aria-modal="true" aria-label={headline}>
        {icon && <div className="m3-dialog__icon"><Icon name={icon} /></div>}
        {headline && <h2 className="m3-dialog__headline" style={icon ? { textAlign: 'center' } : undefined}>{headline}</h2>}
        <div className="m3-dialog__body">{children}</div>
        {actions && <div className="m3-dialog__actions">{actions}</div>}
      </div>
    </div>
  );
}

/** Shows message for `duration` ms then calls onClose. */
export function Snackbar({ open, message, actionLabel, onAction, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);
  if (!open) return null;
  return (
    <div className="m3-snackbar" role="status">
      <span className="m3-snackbar__text">{message}</span>
      {actionLabel && <Button variant="text" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

export function LinearProgress({ value, className }) {
  const indeterminate = value === undefined;
  return (
    <div className={cx('m3-progress', indeterminate && 'm3-progress--indeterminate', className)} role="progressbar" aria-valuenow={indeterminate ? undefined : Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="m3-progress__bar" style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function CircularProgress({ size = 40 }) {
  return (
    <svg className="m3-circular" width={size} height={size} viewBox="0 0 48 48" role="progressbar" aria-label="Chargement">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 200" />
    </svg>
  );
}

export const Badge = ({ children }) => <span className="m3-badge">{children}</span>;

export function EmptyState({ icon = 'inbox', title, children, action }) {
  return (
    <div className="m3-empty">
      <Icon name={icon} />
      {title && <div className="title-large" style={{ color: 'var(--md-sys-color-on-surface)' }}>{title}</div>}
      {children && <div className="body-medium">{children}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
