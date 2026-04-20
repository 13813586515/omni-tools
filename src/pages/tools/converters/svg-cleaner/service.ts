import { InitialValuesType, SVGOCleanResult } from './types';

function fallbackSVGOptimize(svg: string, options: InitialValuesType): string {
  let result = svg;

  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (options.removeMetadata) {
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  }

  if (options.removeTitle) {
    result = result.replace(/<title[\s\S]*?<\/title>/gi, '');
  }

  if (options.removeDesc) {
    result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '');
  }

  if (options.cleanupIDs) {
    result = result.replace(/\sid="[^"]*"/g, '');
    result = result.replace(/\surl\(#([^)]+)\)/g, '');
  }

  if (options.removeEditorsNSData) {
    result = result.replace(
      /\sxmlns:(inkscape|sodipodi|sketch|illustrator|figma|corel|adobe)[^=]*="[^"]*"/gi,
      ''
    );
    result = result.replace(
      /\s(inkscape|sodipodi|sketch|illustrator|figma|corel|adobe):[^=]*="[^"]*"/gi,
      ''
    );
  }

  if (options.removeScripts) {
    result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
  }

  if (options.removeStyleElement) {
    result = result.replace(/<style[\s\S]*?<\/style>/gi, '');
  }

  if (options.removeXMLNS) {
    result = result.replace(/\sxmlns="[^"]*"/g, '');
    result = result.replace(/\sxmlns:xlink="[^"]*"/g, '');
  }

  if (options.removeDimensions) {
    result = result.replace(/\swidth="[^"]*"/g, '');
    result = result.replace(/\sheight="[^"]*"/g, '');
    result = result.replace(/\swidth='[^']*'/g, '');
    result = result.replace(/\sheight='[^']*'/g, '');
  }

  if (options.removeViewBox) {
    result = result.replace(/\sviewBox="[^"]*"/g, '');
    result = result.replace(/\sviewBox='[^']*'/g, '');
  }

  if (options.cleanupNumericValues) {
    result = result.replace(/([\d.]+)px/g, '$1');
    result = result.replace(/\d+\.\d+/g, (match) => {
      const num = parseFloat(match);
      return Math.round(num * 100) / 100 === Math.round(num)
        ? Math.round(num).toString()
        : (Math.round(num * 100) / 100).toString();
    });
  }

  if (options.removeEmptyAttrs) {
    result = result.replace(/\s[\w-]+=""/g, '');
    result = result.replace(/\s[\w-]+=''(\s|>)/g, '$1');
  }

  if (options.removeHiddenElems) {
    result = result.replace(
      /<[^>]*style="[^"]*display:\s*none[^"]*"[^>]*>[\s\S]*?<\/[^>]*>/gi,
      ''
    );
    result = result.replace(
      /<[^>]*style='[^']*display:\s*none[^']*'[^>]*>[\s\S]*?<\/[^>]*>/gi,
      ''
    );
  }

  if (options.removeEmptyText) {
    result = result.replace(/<text[^>]*>\s*<\/text>/gi, '');
    result = result.replace(/<tspan[^>]*>\s*<\/tspan>/gi, '');
  }

  if (options.removeEmptyContainers) {
    let prevLength = -1;
    while (prevLength !== result.length) {
      prevLength = result.length;
      result = result.replace(/<g\s*\/>/g, '');
      result = result.replace(/<g[^>]*>\s*<\/g>/g, '');
      result = result.replace(/<defs[^>]*>\s*<\/defs>/g, '');
    }
  }

  if (options.removeAttrs && options.removeAttrsList) {
    const attrs = options.removeAttrsList
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    for (const attr of attrs) {
      const regexDouble = new RegExp(`\\s${attr}="[^"]*"`, 'gi');
      const regexSingle = new RegExp(`\\s${attr}='[^']*'`, 'gi');
      result = result.replace(regexDouble, '');
      result = result.replace(regexSingle, '');
    }
  }

  result = result.replace(/>\s+</g, '><');
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/> </g, '><');
  result = result.trim();

  return result;
}

export async function optimizeSVG(
  svgContent: string,
  options: InitialValuesType
): Promise<SVGOCleanResult> {
  const originalSize = new Blob([svgContent]).size;
  const optimizedSVG = fallbackSVGOptimize(svgContent, options);

  const optimizedSize = new Blob([optimizedSVG]).size;
  const savedBytes = originalSize - optimizedSize;
  const savedPercent = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

  return {
    data: optimizedSVG,
    originalSize,
    optimizedSize,
    savedBytes,
    savedPercent
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
