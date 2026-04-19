/**
 * Existe porque Jest no puede procesar archivos SVG.
 * En producción (Vite) los SVGs se procesan normalmente; el mock solo aplica durante las pruebas unitarias.
 */

const React = require('react');
const SvgMock = React.forwardRef((props, ref) => React.createElement('svg', { ...props, ref }));
SvgMock.displayName = 'SvgMock';
module.exports = SvgMock;
module.exports.default = SvgMock;
module.exports.ReactComponent = SvgMock;
