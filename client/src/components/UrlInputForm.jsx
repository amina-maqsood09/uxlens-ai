import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * URL validation: required, and must be a usable http(s) address.
 * We silently allow missing protocols ("example.com") — the backend
 * normalizes them to https:// anyway.
 */
const schema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a URL to analyze.')
    .refine((value) => {
      const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      try {
        const parsed = new URL(candidate);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'That doesn\u2019t look like a valid web address. Try e.g. example.com'),
});

export default function UrlInputForm({ onSubmit, busy = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form
      className="url-form"
      onSubmit={handleSubmit(({ url }) => onSubmit(url))}
      noValidate
    >
      <div className={`url-input-wrap ${errors.url ? 'has-error' : ''}`}>
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://example.com"
          aria-label="Website URL"
          aria-invalid={errors.url ? 'true' : 'false'}
          disabled={busy}
          {...register('url')}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
      {errors.url && <p className="field-error" role="alert">{errors.url.message}</p>}
    </form>
  );
}
