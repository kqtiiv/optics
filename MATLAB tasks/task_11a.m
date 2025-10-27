clear; close all; clc;

% Refractive indices for colours
n_colors = [1.3310, 1.3321, 1.3327, 1.3338, 1.3350, 1.3362, 1.3390];
color_names = {'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'};
color_rgb = [1 0 0; 1 0.5 0; 1 1 0; 0 1 0; 0 0 1; 0.3 0 0.5; 0.5 0 1];

% Angle range
theta_deg = linspace(0, 90, 500);
theta_rad = deg2rad(theta_deg);

% Initialize figure
figure;
hold on;
grid on;
box on;

% Plot primary rainbow for each colour
for i = 1:length(n_colors)
    n = n_colors(i);
    
    % Primary rainbow calculations
    epsilon_primary = rad2deg(pi - 6*asin(sin(theta_rad)/n) + 2*theta_rad);
    theta_primary = asin(sqrt((9 - n^2)/8));
    
    scatter(theta_deg, epsilon_primary, 2, color_rgb(i,:), 'filled', ...
           'DisplayName', sprintf('%s (n=%.4f)', color_names{i}, n));
    
    % Mark minimum point for this colour
    plot(rad2deg(theta_primary), rad2deg(pi - 6*asin(sin(theta_primary)/n)) + 2*rad2deg(theta_primary), 'ko', 'MarkerSize', 6, 'MarkerFaceColor', color_rgb(i,:));
    yline(rad2deg(pi - 6*asin(sin(theta_primary)/n)) + 2*rad2deg(theta_primary), 'Color', color_rgb(i,:)*0.7, 'LineWidth', 2);
end

% Plot secondary rainbow for each colour
for i = 1:length(n_colors)
    n = n_colors(i);
    
    % Secondary rainbow calculations
    epsilon_secondary = rad2deg(4*asin(sin(theta_rad)/n) - 2*theta_rad);
    theta_secondary = asin(sqrt((4 - n^2)/3));
    
    scatter(theta_deg, epsilon_secondary, 2, color_rgb(i,:)*0.7, 'filled', ...
           'DisplayName', sprintf('%s Secondary (n=%.4f)', color_names{i}, n));
    
    % Mark minimum point for this colour
    plot(rad2deg(theta_secondary), rad2deg(4*asin(sin(theta_secondary)/n)) - 2*rad2deg(theta_secondary), ...
         'ko', 'MarkerSize', 6, 'MarkerFaceColor', color_rgb(i,:)*0.7);
    yline(rad2deg(4*asin(sin(theta_secondary)/n)) - 2*rad2deg(theta_secondary), 'Color', color_rgb(i,:)*0.7);
end

% Add labels and title
xlabel('\theta /degrees');
ylabel('\epsilon /degrees');
title('Elevation of deflected beam /deg');
subtitle(['Primary $\epsilon = 40.9^\circ$ to $42.5^\circ$, '...
          'Secondary $\epsilon = 50.2^\circ$ to $53^\circ$'], ...
          'Interpreter', 'latex');
% Set y-axis ticks
yticks(0:20:180);

% Set axis limits
xlim([0 90]);
ylim([0 180]);

