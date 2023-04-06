---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---


Before installing IOMesh, refer to the following to choose how you install IOMesh.
- Quick Installation：One click to install IOMesh online, but all parameters take default values and cannot be modified.
- Custom Installation: Configure parameters during installation on your own, but during installation, you must ensure that the Kubernetes cluster network is connected to the public network.
- Offline Installation: Recommended when the Kubernetes cluster cannot communicate with the public network and support for custom parameters during installation.

## Quick Installation

The quick installation option is limited to deploying IOMesh on three worker nodes only, and it only supports hybrid disk configurations.

1. Replace `10.234.1.0/24` with the actual network segment and run the command to install IOMesh. After executing the following command, wait for a few minutes. Note that `Helm3` is included in the commands below. It will be installed automatically if it is not found. 

    ```shell
    # The IP address of each worker node running IOMesh must be within the same IOMESH_DATA_CIDR segment.
    export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh.sh | sh -
    ```

2. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully installed.

    ```shell
    watch kubectl get --namespace iomesh-system pods
    ```

    > _Note:_
    > IOMesh resources left by running the above commands will be saved for troubleshooting if any error occurs during installation. You can run the command `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -` to remove all IOMesh resources from the Kubernetes cluster.

## Custom Installation 

1. Install `Helm`. Skip this step if `Helm` is already installed. 

    ```shell
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
    chmod 700 get_helm.sh
    ./get_helm.sh
    ```

   For more details, refer to **[Installing Helm](https://helm.sh/docs/intro/install/)**.

2. Add the IOMesh Helm repository.

    ```shell
    helm repo add iomesh http://iomesh.com/charts
    ```

3. Export the IOMesh default configuration file `iomesh.yaml`. 

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

4. Configure `iomesh.yaml`.

    - Fill in [`dataCIDR`](../deploy-iomesh-cluster/prerequisites.md#network-requirements).

      ```yaml
        iomesh:
          chunk:
            dataCIDR: "" # Fill in the dataCIDR you configured previously in Prerequisites.
      ```

    - Set `diskDeploymentMode` according to your [disk configurations](../deploy-iomesh-cluster/prerequisites.md#hardware-requirements). The system defaults to `hybridFlash`. 

      ```yaml
      diskDeploymentMode: "hybridFlash" # Set the disk deployment mode.
      ```
    
    - Specify IOMesh `edition`, which defaults to `community`. In case you have purchased the Enterprise Edition, set the value of `edition` to `enterprise`. For details, refer to [IOMesh Specifications](https://www.iomesh.com/spec).
   
   ```yaml
    edition: "community" # Specify the IOMesh edition.
    ```

   - An optional step: The number of IOMesh chunk pods is 3 by default. If you install IOMesh Enterprise Edition, you can deploy more than 3 chunk pods

   ```yaml
    iomesh:
      chunk:
        replicaCount: 5 # Specify IOMesh chunk pods number.
    ```

   - An optional step: If you want IOMesh to only use the disks of specific Kubernetes nodes, configure the label of the corresponding node in the `chunk.podPolicy.affinity` field.
      
      ```yaml
      iomesh:
        chunk:
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname 
                      operator: In
                      values:
                      - iomesh-worker-0 # Specify the values of the node label.
                      - iomesh-worker-1
      ```

      It is recommended that you only configure `values`. For more configurations, refer to [Pod Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity).

5. Deploy the IOMesh cluster.

    ```shell
    helm install iomesh iomesh/iomesh \
            --create-namespace \
            --namespace iomesh-system \
            --values iomesh.yaml \
            --wait
    ```

    If successful, you should see output like:

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

6. Verify that all pods are running. If all pods are shown `Running`, then IOMesh has been installed successfully.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    If successful, you should see an example like:

    ```output
    NAME                                                  READY   STATUS    RESTARTS   AGE
    csi-driver-controller-plugin-89b55d6b5-8r2fc          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-d4rbr          6/6     Running   10         2m8s
    csi-driver-controller-plugin-89b55d6b5-n5s48          6/6     Running   10         2m8s
    csi-driver-node-plugin-9wccv                          3/3     Running   2          2m8s
    csi-driver-node-plugin-mbpnk                          3/3     Running   2          2m8s
    csi-driver-node-plugin-x6qrk                          3/3     Running   2          2m8s
    iomesh-chunk-0                                        3/3     Running   0          52s
    iomesh-chunk-1                                        3/3     Running   0          47s
    iomesh-chunk-2                                        3/3     Running   0          43s
    iomesh-hostpath-provisioner-8fzvj                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-gfl9k                     1/1     Running   0          2m8s
    iomesh-hostpath-provisioner-htzx9                     1/1     Running   0          2m8s
    iomesh-iscsi-redirector-96672                         2/2     Running   1          55s
    iomesh-iscsi-redirector-c2pwm                         2/2     Running   1          55s
    iomesh-iscsi-redirector-pcx8c                         2/2     Running   1          55s
    iomesh-meta-0                                         2/2     Running   0          55s
    iomesh-meta-1                                         2/2     Running   0          55s
    iomesh-meta-2                                         2/2     Running   0          55s
    iomesh-openebs-ndm-5457z                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-599qb                              1/1     Running   0          2m8s
    iomesh-openebs-ndm-cluster-exporter-68c757948-gszzx   1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-kzjfc                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-qc9pt                1/1     Running   0          2m8s
    iomesh-openebs-ndm-node-exporter-v7sh7                1/1     Running   0          2m8s
    iomesh-openebs-ndm-operator-56cfb5d7b6-srfzm          1/1     Running   0          2m8s
    iomesh-openebs-ndm-svp9n                              1/1     Running   0          2m8s
    iomesh-zookeeper-0                                    1/1     Running   0          2m3s
    iomesh-zookeeper-1                                    1/1     Running   0          102s
    iomesh-zookeeper-2                                    1/1     Running   0          76s
    iomesh-zookeeper-operator-7b5f4b98dc-6mztk            1/1     Running   0          2m8s
    operator-85877979-66888                               1/1     Running   0          2m8s
    operator-85877979-s94vz                               1/1     Running   0          2m8s
    operator-85877979-xqtml                               1/1     Running   0          2m8s
    ```

    [1]: http://iomesh.com/charts
    [2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

## Offline Installation

1. Download [IOMesh Offline Installation Package](https://download.smartx.com/iomesh-offline-v0.11.1.tgz).

2. Unpack the installation package.

    ```shell
    tar -xf  iomesh-offline-v0.11.1.tgz && cd iomesh-offline
    ```
3. Load the IOMesh image on each Kubernetes node and then execute the corresponding scripts based on your container runtime and container manager.

  <!--DOCUSAURUS_CODE_TABS-->

  <!--Docker-->
  ```shell
  docker load --input ./images/iomesh-offline-images.tar
  ```
  <!--Containerd-->
  ```shell
  ctr --namespace k8s.io image import ./images/iomesh-offline-images.tar
  ```

  <!--Podman-->
  ```shell
  podman load --input ./images/iomesh-offline-images.tar
  ```

  <!--END_DOCUSAURUS_CODE_TABS-->

4. Export the IOMesh default configuration file `iomesh.yaml`. 

    ```shell
    ./helm show values charts/iomesh > iomesh.yaml
    ```

5. Configure `iomesh.yaml`.

   - Fill in [`dataCIDR`](../deploy-iomesh-cluster/prerequisites.md#network-requirements).

      ```yaml
      iomesh:
        chunk:
          dataCIDR: "" # Fill in the dataCIDR you configured previously in Prerequisites.
      ```

    - Set `diskDeploymentMode` according to your [disk configurations](../deploy-iomesh-cluster/prerequisites.md#hardware-requirements). The system defaults to `hybridFlash`. 

      ```yaml
      diskDeploymentMode: "hybridFlash" # Set the disk deployment mode.
      ```
    - Specify IOMesh `edition`, which defaults to `community`. In case you have purchased the Enterprise Edition, set the value of `edition` to `enterprise`. For details, refer to [IOMesh Specifications](https://www.iomesh.com/spec).

      ```yaml
      edition: "community" # Specify the IOMesh edition.
      ```
   - An optional step: The number of IOMesh chunk pods is 3 by default. If you install IOMesh Enterprise Edition, you can deploy more than 3 chunk pods.

      ```yaml
        iomesh:
          chunk:
            replicaCount: "" # Specify the number of chunk pods.
      ```

   - An optional step : If you want IOMesh to only use the disks of specific Kubernetes nodes, configure the values of the node label.
   
      ```yaml
      iomesh:
        chunk:
          podPolicy:
            affinity:
              nodeAffinity:
                requiredDuringSchedulingIgnoredDuringExecution:
                  nodeSelectorTerms:
                  - matchExpressions:
                    - key: kubernetes.io/hostname # Specify the key of the node label.
                      operator: In
                      values:
                      - iomesh-worker-0 # Specify the values of the node label.
                      - iomesh-worker-1
        ```
        It is recommended that you only configure `values`. For more configurations, refer to [Pod Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity).

6. Deploy the IOMesh cluster.

    ```shell
    ./helm install iomesh ./charts/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```
    If successful, you should see output below:
    
    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

7. Verify that all pods are running. If all pods are shown `Running`, then IOMesh has been installed successfully.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```
    After running the command, you should see an example like:

    ```output
    NAME                                                   READY   STATUS    RESTARTS   AGE
    iomesh-chunk-0                                         3/3     Running   0          102s
    iomesh-chunk-1                                         3/3     Running   0          98s
    iomesh-chunk-2                                         3/3     Running   0          94s
    iomesh-csi-driver-controller-plugin-5b66557959-jhshb   6/6     Running   10         3m20s
    iomesh-csi-driver-controller-plugin-5b66557959-p4m9x   6/6     Running   10         3m20s
    iomesh-csi-driver-controller-plugin-5b66557959-w9qbq   6/6     Running   10         3m20s
    iomesh-csi-driver-node-plugin-6pjpn                    3/3     Running   2          3m20s
    iomesh-csi-driver-node-plugin-dj2cd                    3/3     Running   2          3m20s
    iomesh-csi-driver-node-plugin-stbdw                    3/3     Running   2          3m20s
    iomesh-hostpath-provisioner-55j8t                      1/1     Running   0          3m20s
    iomesh-hostpath-provisioner-c7jlz                      1/1     Running   0          3m20s
    iomesh-hostpath-provisioner-jqrsd                      1/1     Running   0          3m20s
    iomesh-iscsi-redirector-675vr                          2/2     Running   1          119s
    iomesh-iscsi-redirector-d2j4m                          2/2     Running   1          119s
    iomesh-iscsi-redirector-sjfjk                          2/2     Running   1          119s
    iomesh-meta-0                                          2/2     Running   0          104s
    iomesh-meta-1                                          2/2     Running   0          104s
    iomesh-meta-2                                          2/2     Running   0          104s
    iomesh-openebs-ndm-569pb                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-9fhln                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-cluster-exporter-68c757948-vkkdz    1/1     Running   0          3m20s
    iomesh-openebs-ndm-m64j5                               1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-2brc6                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-g97q5                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-node-exporter-kvn88                 1/1     Running   0          3m20s
    iomesh-openebs-ndm-operator-56cfb5d7b6-gwlg9           1/1     Running   0          3m20s
    iomesh-zookeeper-0                                     1/1     Running   0          3m14s
    iomesh-zookeeper-1                                     1/1     Running   0          2m59s
    iomesh-zookeeper-2                                     1/1     Running   0          2m20s
    iomesh-zookeeper-operator-7b5f4b98dc-fxfb6             1/1     Running   0          3m20s
    operator-85877979-5fvvn                                1/1     Running   0          3m20s
    operator-85877979-74rl6                                1/1     Running   0          3m20s
    operator-85877979-cvgcz                                1/1     Running   0          3m20s
    ```

   


