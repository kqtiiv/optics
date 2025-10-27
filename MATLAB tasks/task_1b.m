%colours_from_f
% Function which provides the R,G,B values( within interval [0,1] )
% of visible light depending on the frequency /THz
function [R,G,B,colour_str] = colours_from_f(f)
    if f < 405
        R = NaN; G = NaN; B = NaN; colour_str = 'Infra Red';
    elseif (f>=405) && ( f < 480 )
        R = 1; G = (f-405)./75 .* 127/255; B = 0; colour_str = 'Red';
    elseif (f>=480) && ( f < 510 )
        R = 1; G = 127/255 + 127/255 .* (f-480)./30; B = 0; colour_str = 'Orange';
    elseif (f>=510) && ( f < 530 )
        R = (530-f)./20; G = 1; B = 0; colour_str = 'Yellow';
    elseif (f>=530) && ( f < 600 )
        R = 0; G = 1; B = (f-530)./70; colour_str = 'Green';
    elseif (f>=600) && ( f < 620 )
        R = 0; G = (620-f)./20; B = 1; colour_str = 'Cyan';
    elseif (f>=620) && ( f < 680 )
        R = (f-620)./60 .* 127/255; G = 0; B = 1; colour_str = 'Blue';
    elseif (f>=680) && ( f <= 790 )
        R = 127/255; G = 0; B = 1; colour_str = 'Violet';
    else
        R = NaN; G = NaN; B = NaN; colour_str = 'Ultra Violet';
    end
end

% empirical formula for refractive index of water over visible range
n = @(f) sqrt(1 + (1.731 - 0.261 * (f / 1e15).^2).^(-1/2));

% frequency range of visible light in THz
f_visible = linspace(405e12,790e12,385);

n_water = n(f_visible);

% Get RGB colors for each frequency
R = zeros(size(f_visible));
G = zeros(size(f_visible));
B = zeros(size(f_visible));
for i = 1:length(f_visible)
    [R(i), G(i), B(i), ~] = colours_from_f(f_visible(i)/1e12);
end
colors = [R(:), G(:), B(:)];

% Plot
figure;
scatter(f_visible./1e12, n_water, 12, colors, "filled");
xlabel('Frequency/THz');
ylabel('Refractive Index');
title('Refractive Index of Water vs. Visible Light Frequency');
grid on;