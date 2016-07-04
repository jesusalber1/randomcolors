var _hexBase = '0123456789ABCDEF';
var _colorLength = 6;
var _clipboardh1 = new Clipboard('h1');
var _clipboardh2 = new Clipboard('h2');
var _previousColor;

/* Generate a random color (hex) */
function randomColor() {
  var color = '#';
  for (var i = 0; i < _colorLength; i++) {
    /* Min and max values inclusive: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
    color += _hexBase.charAt(Math.floor(Math.random() * _hexBase.length));
  }
  return color;
}

/* Convert HEX to RGB (needed to get luminosity) */
function hexToRgb(hex) {
  /* Check if it's a shorthand and expand it (eg. #3F0 to #33FF00) */
  var shorthand;
  if (shorthand = /^#([a-f0-9]{1})([a-f0-9]{1})([a-f0-9]{1})$/i.exec(hex)) {
    hex = '#' + shorthand[1] + shorthand[1] + shorthand[2] + shorthand[2] + shorthand[3] + shorthand[3];
  }

  /* Get RGB from Hex values (convert indexes '01 23 45' from hex to dec bases) */
  var splitted;
  if (splitted = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex)) {
    return {
      red:    parseInt(splitted[1], 16),
      green:  parseInt(splitted[2], 16),
      blue:   parseInt(splitted[3], 16)
    };
  }

  return null;
}

/* Decide if body font is white or black based on the new background color */
function fontColorByBackground(hex) {
  /* Source: http://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color/3943023#3943023 */
  var rgb = hexToRgb(hex);
  if (rgb === null) console.log('error ' + hex);
  return ((rgb.red*0.299 + rgb.green*0.587 + rgb.blue*0.114) > 186) ? '#333' : '#FFF';
}

/* Spacebar event -> Generate new color (it will be binded on document.ready): $(window).keyup(···) */
function handleColorChange(event) {
  /* We get a customEvent or keyup (spacebar) */
  if (event.type === 'customEvent'
      || (event.type === 'keyup' && (event.keyCode === 0 || event.keyCode === 32))) {
    /* Check if there is a previous color and show it */
    if (!!( _previousColor = $('h1').attr('data-clipboard-text'))) {
      $('#previous-wrapper').removeClass('hidden');
      $('#previous-color').text(_previousColor);
    }
    /* Check if we get an old color (previous) or generate a random color */
    var newColor = (event.color) ? event.color : randomColor();
    var newColorRGB = hexToRgb(newColor);
    newColorRGB = 'rgb(' + newColorRGB.red + ', ' + newColorRGB.green + ', ' + newColorRGB.blue + ')';

    /* Set screen values, background and font */
    $('h1') .text(newColor)
            .attr('data-clipboard-text', newColor);
    $('h2') .text(newColorRGB)
            .attr('data-clipboard-text', newColorRGB);
    $('body') .css('background-color', newColor)
              .css('color', fontColorByBackground(newColor));
  }
}

/* Copy color (HEX or RGB) to clipboard */
$('h1, h2').click(function() {
  var $h1 = $('h1');
  var $h2 = $('h2');
  var oldTexth1 = $h1.text();
  var oldTexth2 = $h2.text();
  $h1.text($h1.attr('data-copied'));
  $h1.toggleClass('changed');
  $h2.text(($h1.attr('id') == $(this).attr('id')) ? $h1.attr('data-type') : $h2.attr('data-type'));

  setTimeout(function() {
    $h1.text(oldTexth1);
    $h2.text(oldTexth2);
    $h1.toggleClass('changed');
  }, 1500);
});

$('a#previous-color').click(function() {
  var previousColor = $(this).text();
  $(window).trigger($.Event('customEvent', { color : previousColor }));
});

$(document).ready(function() {
  $(window).on('customEvent', handleColorChange);
  $(window).trigger($.Event('customEvent'));
  /* Waiting 1.5 seconds while showing instructions */
  setTimeout(function() {
    $('main, aside#intro').toggleClass('hidden');
    /* TODO: Mobile events */
    /* Now we also handle spacebar event */
    $(window).on('keyup', handleColorChange);
  }, 1500);
});
