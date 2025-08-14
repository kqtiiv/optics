%colours_from_f
 % Function which provides the R,G,B values( within interval [0,1] )
 % of visible light depending on the frequency /THz
 function [R,G,B,colour_str] = colours_from_f(f)
     if f < 405
     R = NaN; G = NaN; B = NaN; colour_str = 'Infra Red';
     elseif (f>=405) && ( f < 480 )
     R = 1; G = 0; B = 0; colour_str = 'Red';
     elseif (f>=480) && ( f < 510 )
     R = 1; G = 127/255; B = 0; colour_str = 'Orange';
     elseif (f>=510) && ( f < 530 )
     R = 1; G = 1; B = 0; colour_str = 'Yellow';
     elseif (f>=530) && ( f < 600 )
     R = 0; G = 1; B = 0; colour_str = 'Green';
     elseif (f>=600) && ( f < 620 )
     R = 0; G = 1; B = 1; colour_str = 'Cyan';
     elseif (f>=620) && ( f < 680 )
     R = 0; G = 0; B = 1; colour_str = 'Blue';
     elseif (f>=680) && ( f <= 790 )
     R = 127/255; G = 0; B = 1; colour_str = 'Violet';
     else
     R = NaN; G = NaN; B = NaN; colour_str = 'Ultra Violet';
     end
 end

% Frequency range
f_visible = linspace(405e12,790e12,100);
f_thz = f_visible ./ 1e12;

f_visible_smooth = linspace(405,790,385);

% Get RGB colors for each frequency
R = zeros(size(f_visible));
G = zeros(size(f_visible));
B = zeros(size(f_visible));
for i = 1:length(f_visible)
    [R(i), G(i), B(i), ~] = colours_from_f(f_visible(i)/1e12);
end
colors = [R(:), G(:), B(:)];

% empirical formula for refractive index of water over visible range
n = @(f) sqrt(1 + (1.731 - 0.261 * (f / 1e15).^2).^(-1/2));
n_water = n(f_visible);
n_smooth = n(f_visible_smooth .* 1e12);

% Initialize figure
figure;
hold on;
grid on;
box on;

% Primary rainbow 
theta_primary = asin(sqrt((9 - n_water.^2)/8));
phi_primary = rad2deg(asin(sin(theta_primary)./n_water));

theta_primary_smooth = asin(sqrt((9 - n_smooth.^2)/8));
phi_primary_smooth = rad2deg(asin(sin(theta_primary_smooth)./n_smooth));
scatter(f_thz, phi_primary, 20, colors, 'filled');
scatter(f_visible_smooth, phi_primary_smooth, 5, 'red', 'filled');

% Secondary rainbow 
theta_secondary = asin(sqrt((4 - n_water.^2)/3));
phi_secondary = rad2deg(asin(sin(theta_secondary)./n_water));

theta_secondary_smooth = asin(sqrt((4 - n_smooth.^2)/3));
phi_secondary_smooth = rad2deg(asin(sin(theta_secondary_smooth)./n_smooth));
scatter(f_thz, phi_secondary, 20, colors*0.7, 'filled');
scatter(f_visible_smooth, phi_secondary_smooth, 5, 'blue', 'filled');

% Critical angle

crit = rad2deg(asin(1./n_smooth));
scatter(f_visible_smooth, crit, 5, 'white', 'filled');

% Add labels and title
xlabel('Light frequency /THz');
ylabel('\phi /degrees');
title("Refraction angle of single and double rainbows");
legend("","Primary","","Secondary", "Critical Angle");

% Set y-axis ticks
yticks(39:1:49);

% Set axis limits
xlim([405 800]);
ylim([39 49]);

