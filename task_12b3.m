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

rainbow_colors = [
    1.00, 0.00, 0.00;
    1.00, 0.33, 0.00;
    1.00, 0.67, 0.00;
    1.00, 1.00, 0.00;
    0.67, 1.00, 0.00;
    0.33, 1.00, 0.00;
    0.00, 1.00, 0.00;
    0.00, 1.00, 0.33;
    0.00, 1.00, 0.67;
    0.00, 1.00, 1.00;
    0.00, 0.67, 1.00;
    0.00, 0.33, 1.00;
    0.33, 0.00, 1.00;
    0.67, 0.00, 1.00;
    1.00, 0.00, 1.00;
];


n = crown_glass(3e5/(542.5));

% Alpha
alpha = linspace(10, 80, 15);

% Initialize figure
figure;
hold on;
grid on;
box on;

% Add labels and title
xlabel('Angle of incidence /degrees');
ylabel('Deflection angle \delta /degrees');
title('Deflection angle using $f = 542.5\,\mathrm{THz}$', ...
      'Interpreter', 'latex');

for i = 1:length(alpha)
    % Full AOI range
    aoi = linspace(0, 90, 10000);
    aoi_rad = deg2rad(aoi);
    
    % asin argument inside theta_t
    inside = (sqrt(n^2 - (sin(aoi_rad)).^2) .* sin(deg2rad(alpha(i)))) ...
           - sin(aoi_rad) .* cos(deg2rad(alpha(i)));
    
    % Valid AOI up to max where asin is defined
    idx_valid = find(abs(inside) <= 1);
    idx_max = idx_valid(end);
    
    aoi_valid = aoi(1:idx_max);
    aoi_rad_valid = aoi_rad(1:idx_max);
    
    % Calculate theta_t and delta
    theta_t = rad2deg(asin(inside(1:idx_max)));
    delta = aoi_valid + theta_t - alpha(i);
    
    % Find first local maximum of delta
    % Using diff to find where slope changes from positive to negative
    d_delta = diff(delta);
    max_idx_candidates = find(d_delta(1:end-1) > 0 & d_delta(2:end) <= 0) + 1; 
    
    if isempty(max_idx_candidates)
        % If no local max found, start from beginning
        start_idx = 1;
    else
        start_idx = max_idx_candidates(1);
    end
    
    % Select AOI and delta from first maximum to end
    aoi_cut = aoi_valid(start_idx:end);
    delta_cut = delta(start_idx:end);
    
    % Plot
    scatter(aoi_cut, delta_cut, 1, rainbow_colors(i,:), 'filled');
end

legend( ...
    '\alpha=10^{\circ}', '\alpha=15^{\circ}', '\alpha=20^{\circ}', '\alpha=25^{\circ}', ...
    '\alpha=30^{\circ}', '\alpha=35^{\circ}', '\alpha=40^{\circ}', '\alpha=45^{\circ}', ...
    '\alpha=50^{\circ}', '\alpha=55^{\circ}', '\alpha=60^{\circ}', '\alpha=65^{\circ}', ...
    '\alpha=70^{\circ}', '\alpha=75^{\circ}', '\alpha=80^{\circ}', ...
    'Interpreter', 'latex', 'Location', 'eastoutside' );


% Set y-axis ticks
yticks(0:10:90);

% Set axis limits
xlim([0 90]);
ylim([0 90]);
