import { InitialValuesType, SVGOCleanResult } from './types';

function getSVGOPlugins(options: InitialValuesType): unknown[] {
  const plugins: unknown[] = [];

  if (options.removeComments) plugins.push('removeComments');
  if (options.removeMetadata) plugins.push('removeMetadata');
  if (options.removeEditorsNSData) plugins.push('removeEditorsNSData');
  if (options.cleanupAttrs) plugins.push('cleanupAttrs');
  if (options.inlineStyles) plugins.push('inlineStyles');
  if (options.minifyStyles) plugins.push('minifyStyles');
  if (options.convertStyleToAttrs) plugins.push('convertStyleToAttrs');
  if (options.cleanupIDs) plugins.push('cleanupIDs');
  if (options.removeRasterImages) plugins.push('removeRasterImages');
  if (options.removeUselessDefs) plugins.push('removeUselessDefs');
  if (options.cleanupNumericValues) plugins.push('cleanupNumericValues');
  if (options.convertColors) plugins.push('convertColors');
  if (options.removeUnknownsAndDefaults)
    plugins.push('removeUnknownsAndDefaults');
  if (options.removeNonInheritableGroupAttrs)
    plugins.push('removeNonInheritableGroupAttrs');
  if (options.removeUselessStrokeAndFill)
    plugins.push('removeUselessStrokeAndFill');
  if (options.cleanupEnableBackground) plugins.push('cleanupEnableBackground');
  if (options.removeHiddenElems) plugins.push('removeHiddenElems');
  if (options.removeEmptyText) plugins.push('removeEmptyText');
  if (options.convertShapeToPath) plugins.push('convertShapeToPath');
  if (options.moveElemsAttrsToGroup) plugins.push('moveElemsAttrsToGroup');
  if (options.moveGroupAttrsToElems) plugins.push('moveGroupAttrsToElems');
  if (options.collapseGroups) plugins.push('collapseGroups');
  if (options.convertPathData) plugins.push('convertPathData');
  if (options.convertTransform) plugins.push('convertTransform');
  if (options.removeEmptyAttrs) plugins.push('removeEmptyAttrs');
  if (options.removeEmptyContainers) plugins.push('removeEmptyContainers');
  if (options.mergePaths) plugins.push('mergePaths');
  if (options.removeUnusedNS) plugins.push('removeUnusedNS');
  if (options.sortAttrs) plugins.push('sortAttrs');
  if (options.sortDefsChildren) plugins.push('sortDefsChildren');
  if (options.removeTitle) plugins.push('removeTitle');
  if (options.removeDesc) plugins.push('removeDesc');
  if (options.removeDimensions) plugins.push('removeDimensions');
  if (options.removeViewBox) plugins.push('removeViewBox');
  if (options.removeOffCanvasPaths) plugins.push('removeOffCanvasPaths');
  if (options.removeScripts) plugins.push('removeScripts');
  if (options.removeStyleElement) plugins.push('removeStyleElement');
  if (options.removeXMLNS) plugins.push('removeXMLNS');

  if (options.removeAttrs && options.removeAttrsList) {
    const attrs = options.removeAttrsList
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (attrs.length > 0) {
      plugins.push({
        name: 'removeAttrs',
        params: { attrs }
      });
    }
  }

  if (options.addClassesToSVGElement && options.className) {
    plugins.push({
      name: 'addClassesToSVGElement',
      params: {
        classNames: options.className
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      }
    });
  }

  return plugins;
}

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
      /\sxmlns:(inkscape|sodipodi|sketch|illustrator|figma|corel)[^=]*="[^"]*"/gi,
      ''
    );
    result = result.replace(
      /\s(inkscape|sodipodi|sketch|illustrator|figma|corel):[^=]*="[^"]*"/gi,
      ''
    );
  }

  if (options.removeScripts) {
    result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
  }

  if (options.removeStyleElement) {
    result = result.replace(/<style[\s\S]*?<\/style>/gi, '');
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

  result = result.replace(/>\s+</g, '><');
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/> </g, '><');
  result = result.trim();

  if (options.removeEmptyContainers) {
    result = result.replace(/<g\s*\/>/g, '');
    result = result.replace(/<g[^>]*>\s*<\/g>/g, '');
  }

  return result;
}

export async function optimizeSVG(
  svgContent: string,
  options: InitialValuesType
): Promise<SVGOCleanResult> {
  const originalSize = new Blob([svgContent]).size;
  let optimizedSVG: string;

  try {
    // @ts-ignore - svgo is optional, will use fallback if not available
    const svgoModule = await import('svgo/dist/svgo.browser.js').catch(
      () => null
    );

    if (svgoModule && svgoModule.optimize) {
      const plugins = getSVGOPlugins(options);
      const result = svgoModule.optimize(svgContent, {
        multipass: true,
        plugins: plugins.length > 0 ? plugins : ['preset-default']
      });
      optimizedSVG = typeof result === 'string' ? result : result.data;
    } else {
      optimizedSVG = fallbackSVGOptimize(svgContent, options);
    }
  } catch {
    optimizedSVG = fallbackSVGOptimize(svgContent, options);
  }

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
