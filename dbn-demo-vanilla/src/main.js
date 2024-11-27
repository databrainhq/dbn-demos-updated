import "@databrainhq/plugin/web";

function initDashboard() {
  const url = new URL(location.href);
  const token = url.searchParams.get("token") || "";
  const dashboardId = url.searchParams.get("dashboardId") || "";

  // Create the dashboard element
  const dashboardElement = document.createElement('dbn-dashboard');
  
  // Set attributes
  if (token) {
    dashboardElement.setAttribute('token', token);
  }
  
  if (dashboardId) {
    dashboardElement.setAttribute('dashboard-id', dashboardId);
  }

  // Optional: If you want to disable dashboard actions
  // dashboardElement.setAttribute('options', JSON.stringify({ showDashboardActions: false }));

  // Add custom actions example
  // const createMetricButton = document.createElement('button');
  // createMetricButton.textContent = 'Create Metric';
  // createMetricButton.addEventListener('click', () => {
  //   const dbnDashboard = document.querySelector('dbn-dashboard')?.shadowRoot?.querySelector('.dbn-dashboard');
  //   dbnDashboard?.onClickCreateMetric?.();
  // });

  // Append the dashboard to the body
  document.body.appendChild(dashboardElement);
}

// Initialize the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);
