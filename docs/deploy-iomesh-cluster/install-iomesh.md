---
id: install-iomesh
title: Installing IOMesh
sidebar_label: Installing IOMesh
---

如何决定用户使用快速部署还是自定义安装还是离线部署还是 OCP Platform 部署
- 如果用户只是想快速体验下功能，选择快速安装
- 如果用户使用 openshift 那就 OCP Platform 部署
- 其他情况是自定义安装
- 不能访问外网选择离线(外网比较中国化，需要换个说法)

|

IOMesh can be deployed on the Kubernetes platform or Openshift container platform. If you install IOMesh in a Kubernetes cluster, you can select quick installation or manual installation. Note that quick installation will take the default settings in the file, which cannot be modified manually. 

### Installing IOMesh on Kubernetes 

#### Quick Installation

1. Run the corresponding command according to your Linux distribution to install IOMesh. Replace `10.234.1.0/24` with the actual network segment. After executing the following command, wait for a few minutes. 
> **Note:**
> 
> `Helm3`, a package manager for Kubernetes, is included in the commands below. It will be installed automatically if it is not found. 

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
# The IP address of each worker node running IOMesh must be within the same IOMESH_DATA_CIDR segment. 
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
# The IP address of each worker node running IOMesh must be within the same IOMESH_DATA_CIDR segment.
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://iomesh.run/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

2. Run the following command to see if all pods in each worker node are running. If so, then IOMesh has been successfully installed.

    ```shell
    watch kubectl get --namespace iomesh-system pods
    ```

    > **Note:**
    > 
    > IOMesh resources left by running the above commands will be saved for troubleshooting if any error occurs during installation. You can run the command `curl -sSL https://iomesh.run/uninstall_iomesh.sh | sh -` to remove all IOMesh resources from the Kubernetes cluster.

#### Manual Installation 

If you want to configure parameters during installation on your own, follow the steps below to manually install IOMesh.

1. Run the following commands to install `Helm`. Skip this step if `Helm` is already installed. 

    ```shell
    curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
    chmod 700 get_helm.sh
    ./get_helm.sh
    ```

   For more details, refer to **[Installing Helm](https://helm.sh/docs/intro/install/)**.

2. Run the following command to add the IOMesh Helm repository.

    ```shell
    helm repo add iomesh http://iomesh.com/charts
    ```

3. Export the IOMesh default configuration file into `iomesh.yaml`. 

    ```shell
    helm show values iomesh/iomesh > iomesh.yaml
    ```

4. Configure `iomesh.yaml`.

    Mandatory: Fill in `dataCIDR`.

    ```yaml
      iomesh:
        chunk:
          dataCIDR: "10.234.1.0/24" # Replace "10.234.1.0/24" with the actual dataCIDR.
    ```

    Mandatory: Fill in `diskDeploymentMode`. The system defaults to `hybridFlash`. You can also set it to `allFlash`.

    ```yaml
    diskDeploymentMode: "hybridFlash" # Set the disk deployment mode.
    ```
   
    Optional: If you want to specify specific Kubernetes worker nodes to provide disks, configure the values of the node label.
      
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

5. Run the following commands to deploy the IOMesh cluster.

    ```shell
    helm install iomesh iomesh/iomesh \
            --create-namespace \
            --namespace iomesh-system \
            --values iomesh.yaml \
            --wait
    ```

    After running the commands above, you should see an example like:

    ```output
    NAME: iomesh
    LAST DEPLOYED: Wed Jun 30 16:00:32 2021
    NAMESPACE: iomesh-system
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    ```

6. Run the following command to check the results.

    ```bash
    kubectl --namespace iomesh-system get pods
    ```

    After running the command, you should see an example like:

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

    If the status of all pods is `Running` as shown above, then IOMesh has been installed successfully.

    [1]: http://iomesh.com/charts
    [2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network

### Installing IOMesh on OpenShift (这一章要去掉了？；LocalPV 融合部署)

IOMesh can also be installed and running on the RedHat OpenShift container platform. You may install IOMesh through the IOMesh Operator on the OpenShift platform. 

**Prerequisite**

Verify that `oc` or `kubectl` can access the OpenShift cluster.  

**Procedure**

1. Run the following command to install IOMesh Operator dependencies and configure IOMesh specifications and settings for the IOMesh OpenShift cluster. 

    ```shell
    curl -sSL https://iomesh.run/iomesh-operator-pre-install-openshift.sh | sh -
    ```
2. Install IOMesh Operator.

   - Log in to the OpenShift Container Platform and then open the OperatorHub page. 
   - On the OperatorHub page, select **IOMesh Operator** and click **Install** to install IOMesh Operator.
   - Select **Installed Operators** > **IOMesh Operator** > **Create instance** > **YAML view**. 
   - Fill in IOMesh custom resources according to [`iomesh.yaml`](https://iomesh.run/iomesh.yaml). 
   - Change `spec.*.dataCIDR` to your network CIDR.

3. Run the following command to install IOMesh CSI Driver.

    ```shell
    curl -sSL https://iomesh.run/iomesh-operator-post-install-openshift.sh | sh -
    ```
4. 需要补充一个查看的命令？看到怎样的结果证明 IOMesh 在 OpenShift 平台成功安装了。
