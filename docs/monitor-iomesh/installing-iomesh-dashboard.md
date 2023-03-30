---
id: installing-iomesh-dashboard
title: Installing IOMesh Dashboard
sidebar_label: Installing IOMesh Dashboard
---

Monitoring IOMesh storage is implemented on the capabilities of Prometheus and Grafana. Before installing IOMesh dashboard, make sure you have installed Prometheus and Grafana.

### Enabling IOMesh Metrics

**Prerequisite**

Verify that [Prometheus and Prometheus Operator](https://prometheus.io/docs/prometheus/latest/installation/) are already installed, and Prometheus is located in the Namespace `iomesh-system`.

**Procedure**

1. Get `iomesh.yaml` ready. 

    If you previously chose quick or offline installation, run the corresponding command to export `iomesh.yaml`. For custom installation, you already have `iomesh.yaml` when you manually install IOMesh.  


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

3. Run the corresponding command to apply configurations according to your installation.


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

4. Run the following commands to verify whether your configurations are applied.

    `ServiceMonitor`
    ```bash
    kubectl -n iomesh-system get servicemonitor
    ```

    After running the command, you should see an example like:

    ```output
    NAME                 AGE
    iomesh               10m
    iomesh-operator      10m
    kube-state-metrics   10m
    ````
    
    `PodMonitor`

    ```bash
    kubectl -n iomesh-system get podmonitor
    ```
    After running the command, you should see an example like:

    ```output
    NAME                         AGE
    blockdevice-monitor          10m
    blockdevice-monitor-prober   10m
    ```
    
    `PrometheusRule`

    ```bash
    kubectl -n iomesh-system get prometheusrule
    ```

    After running the command, you should see an example like:
    
    ```output
    NAME                 AGE
    blockdevicemonitor   10m
    iomesh               10m
    ```

    If `kube-state-metrics` service is enabled，verify that if it is already installed.

    ```bash
    kubectl -n iomesh-system get pods -l app.kubernetes.io/name=kube-state-metrics
    ```

    After running the command, you should see an example like:
    ```output
    NAME                                  READY   STATUS    RESTARTS   AGE
    kube-state-metrics-7bb75797f9-h9r97   1/1     Running   0          10m
    ```

### Importing Grafana Dashboard

Once you have enabled IOMesh metrics, go to Grafana to import Grafana Dashboard.

**Prerequisite**

You have downloaded [`IOMesh-cluster-dashboard.json` file](./assets/iomesh-cluster-dashboard.json) .

**Procedure**

1. Log in [Grafana](https://grafana.com/auth/sign-in/?plcmt=top-nav&cta=myaccount).

2. In the upper left corner of Dashboard homepage, click **Dashboard** > **+ Import**. 

3. Import `IOMesh-cluster-dashboard.json` file. Once done, you will be able to see IOMesh storage on the dashboard.





