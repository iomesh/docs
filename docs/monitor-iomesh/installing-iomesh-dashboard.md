---
id: installing-iomesh-dashboard
title: Installing IOMesh Dashboard
sidebar_label: Installing IOMesh Dashboard
---

Monitoring IOMesh storage is implemented on the capabilities of Prometheus and Grafana. Before installing IOMesh dashboard, make sure you have installed Prometheus and Grafana.

### Enabling IOMesh Metrics

**Prerequisite**

Verify that Prometheus and Prometheus Operator are already installed [加一个安装参考链接], and Prometheus is located in the Namespace `iomesh-system`.

**Procedure**

1. Get `iomesh.yaml` ready. 

    If you previously chose quick or offline installation, run the corresponding command to export `iomesh.yaml`. For custom installation, you already already have `iomesh.yaml` when you manually install IOMesh.  


<!--DOCUSAURUS_CODE_TABS-->

<!--Quick-->
```shell
helm -n iomesh-system get values iomesh -o yaml > iomesh.yaml
```
<!--Offline-->
```shell
./helm -n iomesh-system get values iomesh -o yaml > iomesh.yaml
```
<!--END_DOCUSAURUS_CODE_TABS-->


2. Edit `iomesh.yaml`, including `operator`, `iomesh`, and `blockdevice monitor`.

    `operator`

    ```yaml
    operator:
      metricsPort: 8080

      # Configure ServiceMonitor for Prometheus Operator.
      serviceMonitor: 
        create: true # Set it to true to create a ServiceMonitor object, which defaults to false.
        namespace: "iomesh-system" # Create a Namespace for ServiceMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for ServiceMonitor object, which defaults to blank.

        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
      
      # Configure PrometheusRule for Prometheus Operator.
      prometheusRule:
        create: true # Set it to true to create a PrometheusRule object, which defaults to false.
        namespace: "iomesh-system" # Create a Namespace for PrometheusRule object, which defaults to iomesh-system.
        labels: {} # Set the label for PrometheusRule object, which defaults to blank.
  
      # Configure kube-state-metrics service.
      kubeStateMetrics:
        create: false # Whether you deploy kube-state-metrics service. If it is already deployed, set it to false.
        image:
          registry: registry.k8s.io
          repo: kube-state-metrics/kube-state-metrics
          tag: v2.7.0

        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```

    `iomesh` 

    ```yaml
    iomesh:
      # Configure ServiceMonitor for Prometheus.
      serviceMonitor:
        create: true # Set it to true to create a serviceMonitor object, which defaults to false.
        namespace: "iomesh-system" # Create a Namespace for serviceMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for serviceMonitor object, which defaults to blank. 
      meta:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
      chunk:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>.  
        relabelings: [] # Set relabeling parameters for metrics, which defaults to blank.
    ```

    `blockdevice monitor`

    ```yaml
    blockdevice-monitor:
      podMonitor:
        create: true # Set it to true to create a PodMonitor object, which defaults to false.
        namespace: "iomesh-system" # Create a Namespace for PodMonitor object, which defaults to iomesh-system.
        labels: {} # Set the label for PodMonitor object, which defaults to blank.
      prometheusRule:
        create: true # Set it to true to create a PrometheusRule object, which defaults to false.
        namespace: "iomesh-system" # Create a Namespace for PrometheusRule object, which defaults to iomesh-system.
        labels: {} # Set the label for PrometheusRule object, which defaults to blank.
      blockdevicemonitor:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
        relabelings: [] # Set relabelings parameters, which defaults to blank.
      prober:
        # Configure Relabelings. See more information at <https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config>. 
        relabelings: [] # Set relabelings parameters, which defaults to blank.
    ```

3. Run the corresponding command to apply modifications according to your installation.


<!--DOCUSAURUS_CODE_TABS-->

<!--Quick/Custom-->
```shell
helm -n iomesh-system upgrade iomesh iomesh/iomesh -f ./iomesh.yaml
```
<!--Offline-->
```shell
./helm -n iomesh-system upgrade iomesh charts/iomesh -f ./iomesh.yaml
```
<!--END_DOCUSAURUS_CODE_TABS-->



加运行命令后输出的结果

### Importing Grafana Dashboard

Once you have enabled IOMesh metrics, go to Grafana to import Grafana Dashboard.

**Prerequisite**

You have downloaded `IOMesh-cluster-dashboard.json` file. (提供一个链接) 

**Procedure**

1. Log in [Grafana](https://grafana.com/auth/sign-in/?plcmt=top-nav&cta=myaccount).

2. In the upper left corner of Dashboard homepage, click **Dashboard** > **+ Import**. 

3. Import `IOMesh-cluster-dashboard.json` file. Once done, you will be able to see IOMesh storage on the dashboard.





