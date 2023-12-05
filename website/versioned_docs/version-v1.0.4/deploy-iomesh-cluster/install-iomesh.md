---
id: version-v1.0.4-install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
original_id: install-iomesh
---

IOMesh can be installed on all Kubernetes platforms using various methods. Choose the installation method based on your environment. If the Kubernetes cluster network cannot connect to the public network, opt for custom offline installation.

- One-click online installation: Use the default settings in the file without custom parameters.
- Custom online installation: Supports custom parameters.
- Custom offline installation: Supports custom parameters.

## One-Click Online Installation

**Prerequisite**
- The CPU architecture of the Kubernetes cluster must be Intel x86_64 or Kunpeng AArch64.

**Limitations**
- The Community Edition is installed by default, which has a 3-node limit.
- Only hybrid disk configurations are allowed. 

**Procedure**

1. Access a master node.
   
2. Run the following command to install IOMesh. Make sure to replace `10.234.1.0/24` with your actual CIDR. After executing the following command, wait for a few minutes. 
    
    > _NOTE:_ One-click online installation utilizes `Helm`, which is included in the following command and will be installed automatically if it is not found. 

    ```shell
    # The IP address of each worker node running IOMesh must be within the same IOMESH_DATA_CIDR.
    export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh.sh | bash -
    ```

3. Verify that all pods are in `Running` state. If so, then IOMesh has been successfully installed.

    ```shell
    watch kubectl get --namespace iomesh-system pods
    ```

    > _NOTE:_ IOMesh resources left by running the above commands will be saved for troubleshooting if any error occurs during installation. You can run the command `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -` to remove all IOMesh resources from the Kubernetes cluster.

    > _NOTE:_ After installing IOMesh, the `prepare-csi` pod will automatically start on all schedulable nodes in the Kubernetes cluster to install and configure `open-iscsi`.  If the installation of `open-iscsi` is successful on all nodes, the system will automatically clean up all `prepare-csi` pods. However, if the installation of `open-iscsi` fails on any node, [manual configuration of open-iscsi](../appendices/setup-worker-node) is required to determine the cause of the installation failure.

    > _NOTE:_ If `open-iscsi` is manually deleted after installing IOMesh, the `prepare-csi` pod will not automatically start to install `open-iscsi` when reinstalling IOMesh. In this case, [manual configuration of open-iscsi](../appendices/setup-worker-node) is necessary.

## Custom Online Installation 

**Prerequisite**

Make sure the CPU architecture of your Kubernetes cluster is Intel x86_64, Hygon x86_64, or Kunpeng AArch64. 

**Procedure**
1. Access a master node in the Kubernetes cluster.
   
2. Install `Helm`. Skip this step if `Helm` is already installed. 

    ```shell
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
    chmod 700 get_helm.sh
    ./get_helm.sh
    ```

   For more details, refer to **[Installing Helm](https://helm.sh/docs/intro/install/)**.

3. Add the IOMesh Helm repository.

    ```shell
    helm repo add iomesh http://iomesh.com/charts
    ```

4. Export the IOMesh default configuration file `iomesh.yaml`. 

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

5. Configure `iomesh.yaml`.

    - Set `dataCIDR` to the CIDR you previously configured in [Prerequisites](../deploy-iomesh-cluster/prerequisites#network-requirements).

      ```yaml
        iomesh:
          chunk:
            dataCIDR: "" # Fill in the dataCIDR you configured in Prerequisites.
      ```

    - Set `diskDeploymentMode` according to your [disk configurations](../deploy-iomesh-cluster/prerequisites#hardware-requirements). The system has a default value of `hybridFlash`. If your disk configuration is all-flash mode, change the value to `allFlash`.
      ```yaml
      diskDeploymentMode: "hybridFlash" # Set the disk deployment mode.
      ```
    
   - Specify the CPU architecture. If you have a `hygon_x86_64` Kubernetes cluster, enter `hygon_x86_64`, or else leave the field blank. 

      ```yaml
      platform: ""
      ```

    - Specify the IOMesh edition. The field is blank by default, and if left unspecified, the system will install the Community edition automatically. 
    
      If you have purchased the Enterprise edition, set the value of `edition` to `enterprise`. For details, refer to [IOMesh Specifications](https://www.iomesh.com/spec). 
      
      ```yaml
      edition: "" # If left blank, Community Edition will be installed.
      ```

   - An optional step. The number of IOMesh chunk pods is three by default. If you install IOMesh Enterprise Edition, you can deploy more than three chunk pods.

      ```yaml
      iomesh:
        chunk:
          replicaCount: 3 # Enter the number of chunk pods.
      ```

   - An optional step. If you want IOMesh to only use the disks of specific Kubernetes nodes, configure the label of the corresponding node in the `chunk.podPolicy.affinity` field.
      
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

    - An optional step. Configure the `podDeletePolicy` field to determine whether the system should automatically delete the Pod and rebuild it on another healthy node when the Kubernetes node that hosts the Pod fails. This configuration applies only to the Pod with an IOMesh-created PVC mounted and the access mode set to `ReadWriteOnly`.
    
      If left unspecified, the value of this field will be set to `no-delete-pod` by default,  indicating that the system won't automatically delete and rebuild the Pod in case of node failure.
      ```yaml
      csi-driver:
        driver:
          controller:
            driver:
              podDeletePolicy: "no-delete-pod" # Supports "no-delete-pod", "delete-deployment-pod", "delete-statefulset-pod", or "delete-both-statefulset-and-deployment-pod".
      ```

6. Back on the master node, run the following commands to deploy the IOMesh cluster.

    ```shell
    helm install iomesh iomesh/iomesh \
            --create-namespace \
            --namespace iomesh-system \
            --values iomesh.yaml \
            --wait
    ```

    If successful, you should see output like this:

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

7. Verify that all pods are in `Running` state. If so, then IOMesh has been installed successfully.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    If successful, you should see output like this:

    ```output
    NAME                                                   READY   STATUS    RESTARTS   AGE
    iomesh-blockdevice-monitor-76ddc8cf85-82d4h            1/1     Running   0          3m23s
    iomesh-blockdevice-monitor-prober-kk2qf                1/1     Running   0          3m23s
    iomesh-blockdevice-monitor-prober-w6g5q                1/1     Running   0          3m23s
    iomesh-blockdevice-monitor-prober-z6b7f                1/1     Running   0          3m23s
    iomesh-chunk-0                                         3/3     Running   2          2m17s
    iomesh-chunk-1                                         3/3     Running   0          2m8s
    iomesh-chunk-2                                         3/3     Running   0          113s
    iomesh-csi-driver-controller-plugin-856565b79d-brt2j   6/6     Running   0          3m23s
    iomesh-csi-driver-controller-plugin-856565b79d-g6rnd   6/6     Running   0          3m23s
    iomesh-csi-driver-controller-plugin-856565b79d-kp9ct   6/6     Running   0          3m23s
    iomesh-csi-driver-node-plugin-6pbpp                    3/3     Running   4          3m23s
    iomesh-csi-driver-node-plugin-bpr7x                    3/3     Running   4          3m23s
    iomesh-csi-driver-node-plugin-krjts                    3/3     Running   4          3m23s
    iomesh-hostpath-provisioner-6ffbh                      1/1     Running   0          3m23s
    iomesh-hostpath-provisioner-bqrjp                      1/1     Running   0          3m23s
    iomesh-hostpath-provisioner-rm8ms                      1/1     Running   0          3m23s
    iomesh-iscsi-redirector-2pc26                          2/2     Running   1          2m19s
    iomesh-iscsi-redirector-7msvs                          2/2     Running   1          2m19s
    iomesh-iscsi-redirector-nnbb2                          2/2     Running   1          2m19s
    iomesh-localpv-manager-6flpl                           4/4     Running   0          3m23s
    iomesh-localpv-manager-m8qgq                           4/4     Running   0          3m23s
    iomesh-localpv-manager-p88x7                           4/4     Running   0          3m23s
    iomesh-meta-0                                          2/2     Running   0          2m17s
    iomesh-meta-1                                          2/2     Running   0          2m17s
    iomesh-meta-2                                          2/2     Running   0          2m17s
    iomesh-openebs-ndm-9chdk                               1/1     Running   0          3m23s
    iomesh-openebs-ndm-cluster-exporter-68c757948-2lgvr    1/1     Running   0          3m23s
    iomesh-openebs-ndm-f6qkg                               1/1     Running   0          3m23s
    iomesh-openebs-ndm-ffbqv                               1/1     Running   0          3m23s
    iomesh-openebs-ndm-node-exporter-pnc8h                 1/1     Running   0          3m23s
    iomesh-openebs-ndm-node-exporter-scd6q                 1/1     Running   0          3m23s
    iomesh-openebs-ndm-node-exporter-tksjh                 1/1     Running   0          3m23s
    iomesh-openebs-ndm-operator-bd4b94fd6-zrpw7            1/1     Running   0          3m23s
    iomesh-zookeeper-0                                     1/1     Running   0          3m17s
    iomesh-zookeeper-1                                     1/1     Running   0          2m56s
    iomesh-zookeeper-2                                     1/1     Running   0          2m21s
    iomesh-zookeeper-operator-58f4df8d54-2wvgj             1/1     Running   0          3m23s
    operator-87bb89877-fkbvd                               1/1     Running   0          3m23s
    operator-87bb89877-kfs9d                               1/1     Running   0          3m23s
    operator-87bb89877-z9tfr                               1/1     Running   0          3m23s
    ```
    > _NOTE:_ After installing IOMesh, the `prepare-csi` pod will automatically start on all schedulable nodes in the Kubernetes cluster to install and configure `open-iscsi`.  If the installation of `open-iscsi` is successful on all nodes, the system will automatically clean up all `prepare-csi` pods. However, if the installation of `open-iscsi` fails on any node, [manual configuration of open-iscsi](../appendices/setup-worker-node) is required to determine the cause of the installation failure.

    > _NOTE:_ If `open-iscsi` is manually deleted after installing IOMesh, the `prepare-csi` pod will not automatically start to install `open-iscsi` when reinstalling IOMesh. In this case, [manual configuration of open-iscsi](../appendices/setup-worker-node) is necessary.
## Custom Offline Installation

**Prerequisite**

Make sure the CPU architecture of your Kubernetes cluster is Intel x86_64, Hygon x86_64, or Kunpeng AArch64.

**Procedure**

1. Download the [IOMesh Offline Installation Package](../appendices/downloads) based on your CPU architecture on the master node and each worker node.

2. Unpack the installation package on the master node and each worker node. Make sure to replace `<VERSION>` with `v1.0.1` and  `<ARCH>` based on your CPU architecture.
   - Hygon x86_64: `hygon-amd64` 
   - Intel x86_64: `amd64`  
   - Kunpeng AArch64: `arm64` 

    ```shell
    tar -xf  iomesh-offline-<VERSION>-<ARCH>.tgz && cd iomesh-offline
    ```
3. Load the IOMesh image on the master node and each worker node. Then execute the corresponding script based on your container runtime and container manager.

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

4. On the master node, run the following command to export the IOMesh default configuration file `iomesh.yaml`. 

    ```shell
    ./helm show values charts/iomesh > iomesh.yaml
    ```

5. Configure `iomesh.yaml`.

   - Set `dataCIDR` to the data CIDR you previously configured in [Prerequisites](../deploy-iomesh-cluster/prerequisites#network-requirements).

      ```yaml
      iomesh:
        chunk:
          dataCIDR: "" # Fill in the dataCIDR you configured previously in Prerequisites.
      ```

    - Set `diskDeploymentMode` according to your [disk configurations](../deploy-iomesh-cluster/prerequisites#hardware-requirements). The system has a default value of `hybridFlash`. If your disk configuration is all-flash mode, change the value to `allFlash`.

      ```yaml
      diskDeploymentMode: "hybridFlash" # Set the disk deployment mode.
      ```

    - Specify the CPU architecture. If you have a `hygon_x86_64` Kubernetes cluster, enter `hygon_x86_64`, or else leave the field blank. 

      ```yaml
      platform: ""
      ```

    - Specify the IOMesh edition. The field is blank by default, and if left unspecified, the system will install the Community edition automatically. 
    
      If you have purchased the Enterprise edition, set the value of `edition` to `enterprise`. For details, refer to [IOMesh Specifications](https://www.iomesh.com/spec). 
      
      ```yaml
      edition: "" # If left blank, Community Edition will be installed.
      ```

   - An optional step. The number of IOMesh chunk pods is 3 by default. If you install IOMesh Enterprise Edition, you can deploy more than 3 chunk pods.

      ```yaml
      iomesh:
        chunk:
          replicaCount: 3 # Specify the number of chunk pods.
      ```

   - An optional step. If you want IOMesh to only use the disks of specific Kubernetes nodes, configure the values of the node label.
   
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

    - An optional step. Configure the `podDeletePolicy` field to determine whether the system should automatically delete the pod and rebuild it on another healthy node when the Kubernetes node that hosts the pod fails.  This configuration applies only to the pod with an IOMesh-created PVC mounted and the access mode set to `ReadWriteOnly`.
    
      If left unspecified, the value of this field will be set to `no-delete-pod` by default, indicating that the system won't automatically delete and rebuild the pod in case of node failure.
      ```yaml
      csi-driver:
        driver:
          controller:
            driver:
              podDeletePolicy: "no-delete-pod" # Supports "no-delete-pod", "delete-deployment-pod", "delete-statefulset-pod", or "delete-both-statefulset-and-deployment-pod".
      ```

6. Back on the master node, run the following command to deploy the IOMesh cluster.

    ```shell
    ./helm install iomesh ./charts/iomesh \
        --create-namespace \
        --namespace iomesh-system \
        --values iomesh.yaml \
        --wait
    ```
    If successful, you should see output like this:
    
    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

7. Verify that all pods are in `Running` state. If so, then IOMesh has been installed successfully.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```
    If successful, you should see output like this:
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
    iomesh-localpv-manager-jwng7                          4/4     Running   0          6h23m
    iomesh-localpv-manager-khhdw                          4/4     Running   0          6h23m
    iomesh-localpv-manager-xwmzb                          4/4     Running   0          6h23m
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
    > _NOTE:_ After installing IOMesh, the `prepare-csi` pod will automatically start on all schedulable nodes in the Kubernetes cluster to install and configure `open-iscsi`.  If the installation of `open-iscsi` is successful on all nodes, the system will automatically clean up all `prepare-csi` Pods. However, if the installation of `open-iscsi` fails on any node, [manual configuration of open-iscsi](../appendices/setup-worker-node) is required to determine the cause of the installation failure.

    > _NOTE:_ If `open-iscsi` is manually deleted after installing IOMesh, the `prepare-csi` pod will not automatically start to install `open-iscsi` when reinstalling IOMesh. In this case, [manual configuration of open-iscsi](../appendices/setup-worker-node) is necessary.
   


