function n = crown_glass(lambda)
    %Convert to microns
    x = lambda/1000;
    %Sellmeier coefficients
    a = [1.03961212, 0.231792344, 1.01146945];
    b = [0.00600069867, 0.0200179144, 103.560653];
    %Build up formula for refractive index
    y = zeros(size(x));
    for k=1:length(a)
        y = y + ( a(k)*x.^2 )./( x.^2 - b(k) );
    end
n = sqrt( 1 + y );
end 

n = crown_glass(3e5/(542.5));

% Angle of indcidences
aoi = linspace(5.787, 80, 1000);
aoi_rad = deg2rad(aoi);

theta_t = rad2deg(asin((sqrt(n^2-(sin(aoi_rad)).^2).*sin(deg2rad(45)))-sin(aoi_rad).*cos(deg2rad(45))));

% Initialize figure
figure;
hold on;
grid on;
box on;

% Add labels and title
xlabel('Angle of incidence /degrees');
ylabel('Transmission angle \theta_t /degrees');
title('$\theta_t$ vs $\theta_i$ given $\alpha = 45^\circ$, $f = 542.5\,\mathrm{THz}$, $\theta_{\mathrm{max}} = 5.787^\circ$', ...
      'Interpreter', 'latex');

scatter(aoi, theta_t, 5, 'blue', 'filled');
xline(5.787, 'red')

% Set y-axis ticks
yticks(0:20:100);

% Set axis limits
xlim([0 80]);
ylim([0 100]);
